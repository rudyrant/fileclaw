import SSHClient from '@marcomueglich/react-native-ssh-client';

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

class RealSSHService implements SSHService {
  private client: SSHClient | null = null;
  private connected = false;

  async connect(host: string, port: number, user: string, password?: string, key?: string): Promise<boolean> {
    try {
      if (key) {
        this.client = await SSHClient.connectWithKey(host, port, user, key);
      } else if (password) {
        this.client = await SSHClient.connectWithPassword(host, port, user, password);
      } else {
        throw new Error("Either password or private key must be provided");
      }
      this.connected = true;
      return true;
    } catch (error) {
      console.error("SSH Connection failed:", error);
      this.connected = false;
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      this.client.disconnect();
      this.client = null;
    }
    this.connected = false;
  }

  async execute(command: string): Promise<string> {
    if (!this.client || !this.connected) throw new Error("Not connected");
    return await this.client.execute(command);
  }

  async list(path: string): Promise<SSHFile[]> {
    if (!this.client || !this.connected) throw new Error("Not connected");
    
    try {
      // Use ls -F to mark directories with / and -1 for single column
      // We also use 'ls -la' to get detailed info if we wanted, 
      // but 'ls -F1a' is cleaner for just names + type markers
      const command = `ls -F1a "${path}"`;
      const output = await this.client.execute(command);
      
      const lines = output.split('\n')
        .filter(line => {
          const trimmed = line.trim();
          return trimmed !== '' && trimmed !== './' && trimmed !== '../';
        });
      
      return lines.map(line => {
        const cleanLine = line.trim();
        const isDirectory = cleanLine.endsWith('/');
        const isSymbolicLink = cleanLine.endsWith('@');
        
        // Remove markers (*, /, @, |, =) from the name
        const name = cleanLine.replace(/[*\/@|=]$/, '');
        
        return {
          name: name,
          isDirectory: isDirectory,
          path: path.endsWith('/') ? `${path}${name}` : `${path}/${name}`,
          size: 0
        };
      });
    } catch (error) {
      console.error("List failed:", error);
      return [];
    }
  }

  async readFile(path: string): Promise<string> {
    if (!this.client || !this.connected) throw new Error("Not connected");
    return await this.client.execute(`cat "${path}"`);
  }

  async writeFile(path: string, content: string): Promise<void> {
    if (!this.client || !this.connected) throw new Error("Not connected");
    // Escape single quotes for echo
    const escapedContent = content.replace(/'/g, "'\\''");
    await this.client.execute(`echo '${escapedContent}' > "${path}"`);
  }
}

export const sshService = new RealSSHService();
