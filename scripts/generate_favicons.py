import os
from PIL import Image

def generate():
    # Source is now the new brand icon in public
    icon_path = 'public/favicon.png'
    public_dir = 'public'
    
    if not os.path.exists(icon_path):
        print(f"Error: {icon_path} not found")
        return
        
    img = Image.open(icon_path)
    
    # 1. Favicons
    print("Generating favicon-16x16.png...")
    img.resize((16, 16), Image.Resampling.LANCZOS).save(os.path.join(public_dir, 'favicon-16x16.png'), 'PNG')
    
    print("Generating favicon-32x32.png...")
    img.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(public_dir, 'favicon-32x32.png'), 'PNG')
    
    # 2. Apple Touch Icon
    print("Generating apple-touch-icon.png...")
    img.resize((180, 180), Image.Resampling.LANCZOS).save(os.path.join(public_dir, 'apple-touch-icon.png'), 'PNG')
    
    # 3. Android Chrome Icons
    print("Generating android-chrome-192x192.png...")
    img.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(public_dir, 'android-chrome-192x192.png'), 'PNG')
    
    print("Generating android-chrome-512x512.png...")
    img.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(public_dir, 'android-chrome-512x512.png'), 'PNG')
    
    # 4. ICO (multi-resolution format including 16x16, 32x32, 48x48)
    print("Generating favicon.ico...")
    img.save(os.path.join(public_dir, 'favicon.ico'), format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    
    print("Successfully generated all favicons!")

if __name__ == '__main__':
    generate()
