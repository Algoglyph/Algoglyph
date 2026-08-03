import os

src = "public/images/full-stack/basic-aws-services-dar.png"
dst = "public/images/full-stack/basic-aws-services-dark.png"

if os.path.exists(src):
    os.rename(src, dst)
    print(f"Successfully renamed {src} to {dst}")
else:
    print(f"Error: {src} does not exist!")
