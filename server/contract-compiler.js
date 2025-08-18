import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { generateJettonMinter, generateJettonWallet } from '../client/src/lib/contract-generator.js';

// FunC compiler wrapper
export class ContractCompiler {
  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp_contracts');
    this.ensureTempDir();
  }

  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  // Compile FunC source code to bytecode
  async compileContract(sourceCode, contractName) {
    try {
      const sourceFile = path.join(this.tempDir, `${contractName}.fc`);
      const outputFile = path.join(this.tempDir, `${contractName}.fif`);
      const compiledFile = path.join(this.tempDir, `${contractName}.compiled.json`);

      // Write source code to file
      fs.writeFileSync(sourceFile, sourceCode);

      // Create imports directory with standard library
      const importsDir = path.join(this.tempDir, 'imports');
      if (!fs.existsSync(importsDir)) {
        fs.mkdirSync(importsDir);
      }

      // Copy stdlib.fc to imports
      const stdlibSource = path.join(process.cwd(), 'contracts/imports/stdlib.fc');
      const stdlibDest = path.join(importsDir, 'stdlib.fc');
      if (fs.existsSync(stdlibSource)) {
        fs.copyFileSync(stdlibSource, stdlibDest);
      } else {
        // Create basic stdlib if not exists
        this.createBasicStdlib(stdlibDest);
      }

      // Compile with real FunC compiler using ton-compiler
      try {
        const { compileFunc } = await import('ton-compiler');
        
        console.log(`Compiling ${contractName} with ton-compiler...`);
        
        const result = await compileFunc({
          entryPoints: [sourceFile],
          sources: (path) => {
            if (path === sourceFile) {
              return sourceCode;
            }
            if (path === stdlibDest || path.includes('stdlib.fc')) {
              return fs.readFileSync(stdlibDest, 'utf8');
            }
            throw new Error(`Unknown source file: ${path}`);
          }
        });

        if (result.status === 'error') {
          throw new Error(`Compilation failed: ${result.message}`);
        }

        const compiled = {
          hex: result.codeBoc,
          base64: result.codeBoc // ton-compiler returns base64 directly
        };

        fs.writeFileSync(compiledFile, JSON.stringify(compiled, null, 2));
        console.log(`Successfully compiled ${contractName}`);
        return compiled;

      } catch (compilerError) {
        console.error(`Real compilation failed for ${contractName}:`, compilerError);
        throw new Error(`Failed to compile ${contractName} with ton-compiler: ${compilerError.message}`);
      }

    } catch (error) {
      console.error('Contract compilation failed:', error);
      throw new Error(`Failed to compile ${contractName}: ${error.message}`);
    }
  }

  // Generate contracts from user configuration
  async generateAndCompileContracts(config) {
    try {
      console.log('Generating contracts from user configuration...');

      // Generate FunC source code
      const minterSource = generateJettonMinter(config);
      const walletSource = generateJettonWallet(config);

      console.log('Generated minter contract length:', minterSource.length);
      console.log('Generated wallet contract length:', walletSource.length);

      // Compile both contracts
      const [minterCompiled, walletCompiled] = await Promise.all([
        this.compileContract(minterSource, 'jetton-minter'),
        this.compileContract(walletSource, 'jetton-wallet')
      ]);

      return {
        minter: {
          source: minterSource,
          compiled: minterCompiled
        },
        wallet: {
          source: walletSource,
          compiled: walletCompiled
        }
      };

    } catch (error) {
      console.error('Contract generation failed:', error);
      throw error;
    }
  }

  // Create basic stdlib.fc
  createBasicStdlib(filePath) {
    const stdlib = `
;; Basic stdlib.fc implementation
;; Standard library functions for TON smart contracts

;; Storage operations
cell get_data() asm "c4 PUSH";
() set_data(cell c) impure asm "c4 POP";

;; Message operations
() send_raw_message(cell msg, int mode) impure asm "SENDRAWMSG";

;; Math operations
int now() asm "NOW";

;; Cell operations
builder begin_cell() asm "NEWC";
cell end_cell(builder b) asm "ENDC";
slice begin_parse(cell c) asm "CTOS";

;; Builder operations
builder store_uint(builder b, int x, int len) asm "STU";
builder store_int(builder b, int x, int len) asm "STI";
builder store_coins(builder b, int x) asm "STGRAMS";
builder store_slice(builder b, slice s) asm "STSLICER";
builder store_ref(builder b, cell c) asm "STREF";

;; Slice operations
int load_uint(slice s, int len) asm "LDU";
int load_int(slice s, int len) asm "LDI";
int load_coins(slice s) asm "LDGRAMS";
slice load_msg_addr(slice s) asm "LDMSGADDR";
cell load_ref(slice s) asm "LDREF";

;; Address operations
slice my_address() asm "MYADDR";

;; Exception handling
() throw(int excno) impure asm "THROW";
() throw_if(int excno, int cond) impure asm "THROWIF";
() throw_unless(int excno, int cond) impure asm "THROWIFNOT";

;; Comparison
int equal_slices(slice a, slice b) asm "SDEQ";
int slice_empty?(slice s) asm "SEMPTY";
    `;

    fs.writeFileSync(filePath, stdlib.trim());
  }

  

  // Clean up temporary files
  cleanup() {
    if (fs.existsSync(this.tempDir)) {
      fs.rmSync(this.tempDir, { recursive: true, force: true });
    }
  }
}

export const contractCompiler = new ContractCompiler();