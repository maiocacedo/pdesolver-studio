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
    
    # Manual clean up of build directory to avoid PyInstaller's buggy --clean behavior on Windows
    build_dir = os.path.join(script_dir, "build")
    if os.path.exists(build_dir):
        try:
            shutil.rmtree(build_dir)
        except Exception:
            pass

    sep = ";" if sys.platform == "win32" else ":"
    add_data_flag = f"frontend/dist{sep}frontend/dist"
    
    pyinstaller_cmd = [
        sys.executable,
        "-m",
        "PyInstaller",
        "--onefile",
        "--noconsole",
        "--name=pdesolver-studio",
        f"--add-data={add_data_flag}",
        "run_studio.py"
    ]
    
    subprocess.run(pyinstaller_cmd, check=True)
    print("Build completed successfully! Check the 'dist' directory.")

if __name__ == "__main__":
    main()
