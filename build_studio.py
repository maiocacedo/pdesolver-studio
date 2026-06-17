import os
import subprocess
import sys
import shutil

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    print("Building frontend...")
    frontend_dir = os.path.join(script_dir, "frontend")
    
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    
    subprocess.run([npm_cmd, "install"], cwd=frontend_dir, check=True)
    subprocess.run([npm_cmd, "run", "build"], cwd=frontend_dir, check=True)

    print("Packaging application with PyInstaller...")
    
    sep = ";" if sys.platform == "win32" else ":"
    add_data_flag = f"frontend/dist{sep}frontend/dist"
    
    pyinstaller_cmd = [
        "pyinstaller",
        "--clean",
        "--noconsole",
        "--name=pdesolver-studio",
        f"--add-data={add_data_flag}",
        os.path.join("backend", "main.py")
    ]
    
    subprocess.run(pyinstaller_cmd, check=True)
    print("Build completed successfully! Check the 'dist' directory.")

if __name__ == "__main__":
    main()
