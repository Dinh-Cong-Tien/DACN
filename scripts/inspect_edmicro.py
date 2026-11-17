"""
Script hỗ trợ xem và chụp ảnh giao diện khóa học trên https://toeic.edmicro.vn/learn bằng Playwright.
Dùng profile lưu trữ phiên đăng nhập để không phải đăng nhập lại nhiều lần.
"""

import os
import sys
import time

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from playwright.sync_api import sync_playwright

def main():
    profile_dir = os.path.join(os.path.expanduser("~"), ".edmicro_playwright_profile")
    output_dir = os.path.join(os.getcwd(), "edmicro_screenshots")
    os.makedirs(output_dir, exist_ok=True)

    print("================================================================")
    print(">> Dang khoi dong Playwright Browser (Chromium)...")
    print(f">> Thu muc luu anh giao dien: {output_dir}")
    print(f">> Thu muc luu phien dang nhap: {profile_dir}")
    print("================================================================")

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=profile_dir,
            headless=False,
            viewport={"width": 1440, "height": 900},
            args=["--start-maximized"]
        )

        page = context.pages[0] if context.pages else context.new_page()
        print("🔗 Đang truy cập https://toeic.edmicro.vn/learn ...")
        page.goto("https://toeic.edmicro.vn/learn")

        print("\n>> HUONG DAN:")
        print("1. Neu trang hien thi man hinh Dang nhap (Google), ban hay dang nhap bang tai khoan cua ban.")
        print("2. Sau khi vao trang hoc (/learn), trinh duyet se tu dong chup anh cac trang ban mo.")
        print("3. Ban co the bam vao tung khoa hoc, bai hoc / chuong de xem chi tiet.")
        print("4. Khi xem xong, ban chi can dong cua so trinh duyet.\n")

        # Background URL watcher / manual capture loop
        last_url = ""
        while True:
            time.sleep(2)
            try:
                current_url = page.url
                if current_url != last_url and "login" not in current_url:
                    last_url = current_url
                    time.sleep(1.5) # Wait for animations/render
                    file_slug = current_url.replace("https://toeic.edmicro.vn/", "").replace("/", "_").strip("_") or "learn_home"
                    filepath = os.path.join(output_dir, f"{int(time.time())}_{file_slug[:40]}.png")
                    page.screenshot(path=filepath, full_page=True)
                    print(f">> Da tu dong chup anh man hinh ({current_url}) -> {filepath}")
            except Exception as e:
                # Browser might be closed
                print("Cua so trinh duyet da dong.")
                break

if __name__ == "__main__":
    main()
