#!/usr/bin/env python3
"""
Script de configuración automática para Radix IA Backend
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def print_step(step_name):
    print(f"\n{'='*50}")
    print(f"🔧 {step_name}")
    print(f"{'='*50}")

def run_command(command, cwd=None):
    """Ejecutar comando y manejar errores"""
    try:
        result = subprocess.run(command, shell=True, check=True, cwd=cwd, 
                              capture_output=True, text=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ Error ejecutando: {command}")
        print(f"Error: {e.stderr}")
        return None

def check_python_version():
    """Verificar versión de Python"""
    print_step("Verificando versión de Python")
    version = sys.version_info
    if version.major != 3 or version.minor < 8:
        print("❌ Se requiere Python 3.8 o superior")
        sys.exit(1)
    print(f"✅ Python {version.major}.{version.minor}.{version.micro}")

def create_virtual_environment():
    """Crear entorno virtual"""
    print_step("Creando entorno virtual")
    
    if os.path.exists("venv"):
        print("⚠️  El entorno virtual ya existe")
        return
    
    if run_command("python -m venv venv"):
        print("✅ Entorno virtual creado")
    else:
        print("❌ Error creando entorno virtual")
        sys.exit(1)

def activate_and_install():
    """Activar entorno virtual e instalar dependencias"""
    print_step("Instalando dependencias")
    
    # Determinar comando de activación según el SO
    if os.name == 'nt':  # Windows
        activate_cmd = "venv\\Scripts\\activate"
        pip_cmd = "venv\\Scripts\\pip"
    else:  # Unix/Linux/macOS
        activate_cmd = "source venv/bin/activate"
        pip_cmd = "venv/bin/pip"
    
    # Actualizar pip
    print("📦 Actualizando pip...")
    if run_command(f"{pip_cmd} install --upgrade pip"):
        print("✅ pip actualizado")
    
    # Instalar dependencias
    print("📦 Instalando dependencias desde requirements.txt...")
    if run_command(f"{pip_cmd} install -r requirements.txt"):
        print("✅ Dependencias instaladas")
    else:
        print("❌ Error instalando dependencias")
        sys.exit(1)

def setup_environment_file():
    """Configurar archivo de entorno"""
    print_step("Configurando archivo de entorno")
    
    if os.path.exists(".env"):
        print("⚠️  El archivo .env ya existe")
        return
    
    if os.path.exists(".env.example"):
        shutil.copy(".env.example", ".env")
        print("✅ Archivo .env creado desde .env.example")
        print("⚠️  IMPORTANTE: Edita el archivo .env con tus credenciales")
    else:
        print("❌ No se encontró .env.example")

def create_directories():
    """Crear directorios necesarios"""
    print_step("Creando directorios necesarios")
    
    directories = ["uploads", "logs", "tests", "temp"]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✅ Directorio '{directory}' creado")

def download_model():
    """Descargar modelo de embeddings"""
    print_step("Preparando modelo de embeddings")
    
    print("📦 El modelo se descargará automáticamente al iniciar la aplicación")
    print("   Modelo: jinaai/jina-embeddings-v2-base-es")
    print("   Tamaño aproximado: ~500MB")

def main():
    """Función principal de configuración"""
    print("🏥 Radix IA - Script de Configuración Automática")
    print("=" * 50)
    
    # Verificar que estamos en el directorio correcto
    if not os.path.exists("requirements.txt"):
        print("❌ Ejecutar desde el directorio backend/")
        sys.exit(1)
    
    try:
        check_python_version()
        create_virtual_environment()
        activate_and_install()
        setup_environment_file()
        create_directories()
        download_model()
        
        print_step("Configuración completada")
        print("✅ Backend configurado correctamente")
        print("\n📋 Próximos pasos:")
        print("1. Editar el archivo .env con tus credenciales")
        print("2. Configurar Supabase ejecutando database_setup.sql")
        print("3. Iniciar el servidor: uvicorn main:app --reload")
        print("\n🌐 URLs importantes:")
        print("- API: http://127.0.0.1:8000")
        print("- Docs: http://127.0.0.1:8000/docs")
        print("- ReDoc: http://127.0.0.1:8000/redoc")
        
    except KeyboardInterrupt:
        print("\n⚠️  Configuración cancelada por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error durante la configuración: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()