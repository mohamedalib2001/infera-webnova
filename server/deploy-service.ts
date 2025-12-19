import { storage } from "./storage";
import type { DevProject, ProjectFile, InsertProjectFile } from "@shared/schema";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs/promises";
import path from "path";

const anthropic = new Anthropic();

export interface DeploymentConfig {
  projectId: number;
  userId: number;
  targetPlatform: "web" | "mobile" | "desktop" | "all";
  customDomain?: string;
  environment: "development" | "staging" | "production";
}

export interface DeploymentResult {
  success: boolean;
  deploymentId: string;
  url?: string;
  mobileBundle?: {
    android?: string;
    ios?: string;
  };
  desktopBundle?: {
    windows?: string;
    mac?: string;
    linux?: string;
  };
  message: string;
  timestamp: Date;
}

export interface GeneratedPlatformCode {
  webCode: {
    html: string;
    css: string;
    js: string;
    assets: string[];
  };
  mobileCode?: {
    reactNative: {
      appJs: string;
      packageJson: string;
      components: Record<string, string>;
    };
  };
  desktopCode?: {
    electron: {
      mainJs: string;
      preloadJs: string;
      rendererHtml: string;
      packageJson: string;
    };
  };
}

export class DeployService {
  private deploymentDir = "/tmp/deployments";

  async initializeDeploymentDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.deploymentDir, { recursive: true });
    } catch (error) {
      console.log("Deployment directory already exists or cannot be created");
    }
  }

  async deployProject(config: DeploymentConfig): Promise<DeploymentResult> {
    const deploymentId = `deploy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      await this.initializeDeploymentDirectory();

      const project = await storage.getDevProject(config.projectId);
      if (!project) {
        throw new Error("Project not found");
      }

      const files = await storage.getProjectFiles(config.projectId);
      
      const deployPath = path.join(this.deploymentDir, deploymentId);
      await fs.mkdir(deployPath, { recursive: true });

      for (const file of files) {
        if (file.type === "file" && file.content) {
          const filePath = path.join(deployPath, file.path.replace(/^\//, ""));
          await fs.mkdir(path.dirname(filePath), { recursive: true });
          await fs.writeFile(filePath, file.content, "utf-8");
        }
      }

      const deployedUrl = `https://${project.name.toLowerCase().replace(/\s+/g, "-")}-${deploymentId.slice(-6)}.infera.app`;

      await storage.updateDevProject(config.projectId, {
        isPublished: true,
        publishedUrl: deployedUrl,
        updatedAt: new Date(),
      });

      return {
        success: true,
        deploymentId,
        url: deployedUrl,
        message: "تم نشر المنصة بنجاح! / Platform deployed successfully!",
        timestamp: new Date(),
      };

    } catch (error) {
      console.error("Deployment error:", error);
      return {
        success: false,
        deploymentId,
        message: `فشل النشر: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date(),
      };
    }
  }

  async generateMobileApp(projectId: number): Promise<GeneratedPlatformCode["mobileCode"]> {
    const project = await storage.getDevProject(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const files = await storage.getProjectFiles(projectId);
    const htmlFile = files.find(f => f.path.endsWith(".html") || f.path.endsWith("index.html"));
    const cssFile = files.find(f => f.path.endsWith(".css"));
    const jsFile = files.find(f => f.path.endsWith(".js") && !f.path.includes("node_modules"));

    const webCode = {
      html: htmlFile?.content || "",
      css: cssFile?.content || "",
      js: jsFile?.content || "",
    };

    const prompt = `Convert this web application to a React Native mobile app.

WEB CODE:
HTML: ${webCode.html.substring(0, 5000)}
CSS: ${webCode.css.substring(0, 3000)}
JS: ${webCode.js.substring(0, 3000)}

Generate a complete React Native app with:
1. App.js - Main app component
2. package.json - Dependencies
3. Components for each major section

Return JSON format:
{
  "appJs": "// App.js code here",
  "packageJson": "{ package.json content }",
  "components": {
    "Header.js": "// Header component",
    "Footer.js": "// Footer component"
  }
}`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 8192,
        messages: [{ role: "user", content: prompt }],
      });

      const textContent = response.content.find(c => c.type === "text");
      if (!textContent || textContent.type !== "text") {
        throw new Error("No content generated");
      }

      let jsonStr = textContent.text.trim();
      if (jsonStr.startsWith("```json")) jsonStr = jsonStr.slice(7);
      if (jsonStr.startsWith("```")) jsonStr = jsonStr.slice(3);
      if (jsonStr.endsWith("```")) jsonStr = jsonStr.slice(0, -3);
      jsonStr = jsonStr.trim();

      const startIdx = jsonStr.indexOf("{");
      const endIdx = jsonStr.lastIndexOf("}");
      if (startIdx !== -1 && endIdx !== -1) {
        jsonStr = jsonStr.substring(startIdx, endIdx + 1);
      }

      const result = JSON.parse(jsonStr);
      return {
        reactNative: {
          appJs: result.appJs || getDefaultReactNativeApp(project.name),
          packageJson: result.packageJson || getDefaultPackageJson(project.name),
          components: result.components || {},
        },
      };
    } catch (error) {
      console.error("Mobile generation error:", error);
      return {
        reactNative: {
          appJs: getDefaultReactNativeApp(project.name),
          packageJson: getDefaultPackageJson(project.name),
          components: {},
        },
      };
    }
  }

  async generateDesktopApp(projectId: number): Promise<GeneratedPlatformCode["desktopCode"]> {
    const project = await storage.getDevProject(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const files = await storage.getProjectFiles(projectId);
    const htmlFile = files.find(f => f.path.endsWith(".html") || f.path.endsWith("index.html"));
    const cssFile = files.find(f => f.path.endsWith(".css"));
    const jsFile = files.find(f => f.path.endsWith(".js") && !f.path.includes("node_modules"));

    const webCode = {
      html: htmlFile?.content || "",
      css: cssFile?.content || "",
      js: jsFile?.content || "",
    };

    const prompt = `Convert this web application to an Electron desktop app.

WEB CODE:
HTML: ${webCode.html.substring(0, 5000)}
CSS: ${webCode.css.substring(0, 3000)}
JS: ${webCode.js.substring(0, 3000)}

Generate a complete Electron app with:
1. main.js - Main process
2. preload.js - Preload script
3. renderer.html - Renderer HTML (include CSS inline)
4. package.json - Dependencies

Return JSON format:
{
  "mainJs": "// main.js code",
  "preloadJs": "// preload.js code",
  "rendererHtml": "<!DOCTYPE html>...",
  "packageJson": "{ package.json content }"
}`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 8192,
        messages: [{ role: "user", content: prompt }],
      });

      const textContent = response.content.find(c => c.type === "text");
      if (!textContent || textContent.type !== "text") {
        throw new Error("No content generated");
      }

      let jsonStr = textContent.text.trim();
      if (jsonStr.startsWith("```json")) jsonStr = jsonStr.slice(7);
      if (jsonStr.startsWith("```")) jsonStr = jsonStr.slice(3);
      if (jsonStr.endsWith("```")) jsonStr = jsonStr.slice(0, -3);
      jsonStr = jsonStr.trim();

      const startIdx = jsonStr.indexOf("{");
      const endIdx = jsonStr.lastIndexOf("}");
      if (startIdx !== -1 && endIdx !== -1) {
        jsonStr = jsonStr.substring(startIdx, endIdx + 1);
      }

      const result = JSON.parse(jsonStr);
      return {
        electron: {
          mainJs: result.mainJs || getDefaultElectronMain(project.name),
          preloadJs: result.preloadJs || getDefaultPreload(),
          rendererHtml: result.rendererHtml || webCode.html,
          packageJson: result.packageJson || getDefaultElectronPackageJson(project.name),
        },
      };
    } catch (error) {
      console.error("Desktop generation error:", error);
      return {
        electron: {
          mainJs: getDefaultElectronMain(project.name),
          preloadJs: getDefaultPreload(),
          rendererHtml: webCode.html,
          packageJson: getDefaultElectronPackageJson(project.name),
        },
      };
    }
  }

  async generateFullPlatform(projectId: number): Promise<GeneratedPlatformCode> {
    const [mobileCode, desktopCode] = await Promise.all([
      this.generateMobileApp(projectId),
      this.generateDesktopApp(projectId),
    ]);

    const files = await storage.getProjectFiles(projectId);
    const htmlFile = files.find(f => f.path.endsWith(".html"));
    const cssFile = files.find(f => f.path.endsWith(".css"));
    const jsFile = files.find(f => f.path.endsWith(".js") && !f.path.includes("node_modules"));

    return {
      webCode: {
        html: htmlFile?.content || "",
        css: cssFile?.content || "",
        js: jsFile?.content || "",
        assets: files.filter(f => f.type === "file" && 
          (f.path.endsWith(".png") || f.path.endsWith(".jpg") || f.path.endsWith(".svg"))
        ).map(f => f.path),
      },
      mobileCode,
      desktopCode,
    };
  }

  async downloadMobileBundle(projectId: number): Promise<{ zipPath: string; fileName: string }> {
    const mobileCode = await this.generateMobileApp(projectId);
    const project = await storage.getDevProject(projectId);
    
    const bundleDir = path.join(this.deploymentDir, `mobile_${projectId}_${Date.now()}`);
    await fs.mkdir(bundleDir, { recursive: true });

    await fs.writeFile(path.join(bundleDir, "App.js"), mobileCode!.reactNative.appJs);
    await fs.writeFile(path.join(bundleDir, "package.json"), mobileCode!.reactNative.packageJson);

    const componentsDir = path.join(bundleDir, "components");
    await fs.mkdir(componentsDir, { recursive: true });
    
    for (const [name, content] of Object.entries(mobileCode!.reactNative.components)) {
      await fs.writeFile(path.join(componentsDir, name), content);
    }

    return {
      zipPath: bundleDir,
      fileName: `${project?.name || "app"}-mobile.zip`,
    };
  }

  async downloadDesktopBundle(projectId: number): Promise<{ zipPath: string; fileName: string }> {
    const desktopCode = await this.generateDesktopApp(projectId);
    const project = await storage.getDevProject(projectId);
    
    const bundleDir = path.join(this.deploymentDir, `desktop_${projectId}_${Date.now()}`);
    await fs.mkdir(bundleDir, { recursive: true });

    await fs.writeFile(path.join(bundleDir, "main.js"), desktopCode!.electron.mainJs);
    await fs.writeFile(path.join(bundleDir, "preload.js"), desktopCode!.electron.preloadJs);
    await fs.writeFile(path.join(bundleDir, "index.html"), desktopCode!.electron.rendererHtml);
    await fs.writeFile(path.join(bundleDir, "package.json"), desktopCode!.electron.packageJson);

    return {
      zipPath: bundleDir,
      fileName: `${project?.name || "app"}-desktop.zip`,
    };
  }
}

function getDefaultReactNativeApp(projectName: string): string {
  return `import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, StatusBar } from 'react-native';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.header}>
          <Text style={styles.title}>${projectName}</Text>
          <Text style={styles.subtitle}>تطبيق جوال مبني بـ INFERA</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.text}>مرحباً بك في تطبيقك الجديد!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 20,
    backgroundColor: '#6366f1',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 5,
  },
  content: {
    padding: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: '#374151',
  },
});

export default App;`;
}

function getDefaultPackageJson(projectName: string): string {
  return JSON.stringify({
    name: projectName.toLowerCase().replace(/\s+/g, "-"),
    version: "1.0.0",
    main: "index.js",
    scripts: {
      start: "expo start",
      android: "expo start --android",
      ios: "expo start --ios",
      web: "expo start --web",
    },
    dependencies: {
      expo: "~49.0.0",
      react: "18.2.0",
      "react-native": "0.72.0",
    },
    devDependencies: {
      "@babel/core": "^7.20.0",
    },
  }, null, 2);
}

function getDefaultElectronMain(projectName: string): string {
  return `const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: '${projectName}',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});`;
}

function getDefaultPreload(): string {
  return `const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  version: process.versions.electron,
});`;
}

function getDefaultElectronPackageJson(projectName: string): string {
  return JSON.stringify({
    name: projectName.toLowerCase().replace(/\s+/g, "-"),
    version: "1.0.0",
    main: "main.js",
    scripts: {
      start: "electron .",
      build: "electron-builder",
      "build:win": "electron-builder --win",
      "build:mac": "electron-builder --mac",
      "build:linux": "electron-builder --linux",
    },
    dependencies: {},
    devDependencies: {
      electron: "^27.0.0",
      "electron-builder": "^24.0.0",
    },
    build: {
      appId: `com.infera.${projectName.toLowerCase().replace(/\s+/g, "")}`,
      productName: projectName,
      directories: {
        output: "dist",
      },
      win: {
        target: ["nsis", "portable"],
      },
      mac: {
        target: ["dmg", "zip"],
      },
      linux: {
        target: ["AppImage", "deb"],
      },
    },
  }, null, 2);
}

export const deployService = new DeployService();
