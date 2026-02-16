export interface SSHFile {
  name: string;
  isDirectory: boolean;
  path: string;
  size?: number;
}

export interface SSHService {
  connect(host: string, port: number, user: string, password?: string, key?: string): Promise<boolean>;
  disconnect(): Promise<void>;
  list(path: string): Promise<SSHFile[]>;
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  execute(command: string): Promise<string>;
}

// Mock Implementation
class MockSSHService implements SSHService {
  private connected = false;
  private fileSystem: Record<string, string | Record<string, any>> = {
    '/home/user': {
      'documents': {
        'notes.txt': 'Hello World from SSH!',
        'project': {
          'README.md': '# Project\n\nThis is a mock project.'
        }
      },
      '.bashrc': 'export PATH=$PATH:/usr/local/bin'
    },
    '/var/log': {
      'syslog': 'Feb 16 12:00:00 server systemd[1]: Started Session 1 of user root.'
    }
  };

  async connect(host: string, port: number, user: string, password?: string, key?: string): Promise<boolean> {
    console.log(`Mock connecting to ${user}@${host}:${port} with password: ${password ? '***' : 'none'}`);
    await new Promise<void>(resolve => setTimeout(() => resolve(), 1000)); // Simulate latency
    if (host === 'fail') throw new Error("Connection failed");
    this.connected = true;
    return true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async list(path: string): Promise<SSHFile[]> {
    if (!this.connected) throw new Error("Not connected");
    await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
    
    // Simple path traversal simulation
    let current: any = this.fileSystem;
    const parts = path.split('/').filter(p => p);
    
    for (const part of parts) {
      if (current[part] && typeof current[part] === 'object') {
        current = current[part];
      } else {
        return []; // Path not found or is a file
      }
    }

    if (typeof current !== 'object') return [];

    return Object.keys(current).map(key => ({
      name: key,
      isDirectory: typeof current[key] === 'object',
      path: path === '/' ? `/${key}` : `${path}/${key}`,
      size: typeof current[key] === 'string' ? current[key].length : 0
    }));
  }

  async readFile(path: string): Promise<string> {
    if (!this.connected) throw new Error("Not connected");
    await new Promise<void>(resolve => setTimeout(() => resolve(), 300));

    let current: any = this.fileSystem;
    const parts = path.split('/').filter(p => p);
    
    for (const part of parts) {
        current = current?.[part];
    }

    if (typeof current === 'string') return current;
    throw new Error("File not found or is a directory");
  }

  async writeFile(path: string, content: string): Promise<void> {
    if (!this.connected) throw new Error("Not connected");
    await new Promise<void>(resolve => setTimeout(() => resolve(), 600));
    console.log(`Mock write to ${path}: ${content.substring(0, 20)}...`);
    
    // In a real mock, we'd update this.fileSystem, but for now just logging is enough for UI feedback
    // Updating mock state for consistency
    let current: any = this.fileSystem;
    const parts = path.split('/').filter(p => p);
    const fileName = parts.pop();
    
    if (!fileName) throw new Error("Invalid path");

    for (const part of parts) {
        if (!current[part]) current[part] = {};
        current = current[part];
    }
    current[fileName] = content;
  }

  async execute(command: string): Promise<string> {
    if (!this.connected) throw new Error("Not connected");
    return `Mock output for: ${command}`;
  }
}

export const sshService = new MockSSHService();
