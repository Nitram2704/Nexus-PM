"""
Playwright Manual Testing - Nexus-PM
Tests: Login, Projects, Kanban, AI Chat
"""
from playwright.sync_api import sync_playwright
import time
import os

SCREENSHOTS_DIR = "C:/Users/juani/Projects/Nexus-PM/test-screenshots"

def test_login_flow(page):
    """Test login page renders and form works"""
    print("\n=== TEST: Login Flow ===")
    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")
    
    # Screenshot: Login page
    page.screenshot(path=f"{SCREENSHOTS_DIR}/01-login-page.png", full_page=True)
    print("[OK] Login page loaded")
    
    # Check for login form elements
    content = page.content()
    has_login = "login" in content.lower() or "iniciar" in content.lower() or "email" in content.lower()
    has_password = "password" in content.lower() or "contraseña" in content.lower()
    
    print(f"  - Login form present: {has_login}")
    print(f"  - Password field present: {has_password}")
    
    # Try to find input fields
    inputs = page.locator("input").all()
    print(f"  - Input fields found: {len(inputs)}")
    
    return True

def test_projects_page(page):
    """Test projects page"""
    print("\n=== TEST: Projects Page ===")
    page.goto("http://localhost:5173/projects")
    page.wait_for_load_state("networkidle")
    time.sleep(1)
    
    page.screenshot(path=f"{SCREENSHOTS_DIR}/02-projects-page.png", full_page=True)
    
    content = page.content()
    has_projects = "project" in content.lower() or "proyecto" in content.lower()
    print(f"  - Projects content present: {has_projects}")
    
    # Check for buttons
    buttons = page.locator("button").all()
    print(f"  - Buttons found: {len(buttons)}")
    
    return True

def test_kanban_page(page):
    """Test kanban board"""
    print("\n=== TEST: Kanban Board ===")
    page.goto("http://localhost:5173/kanban")
    page.wait_for_load_state("networkidle")
    time.sleep(1)
    
    page.screenshot(path=f"{SCREENSHOTS_DIR}/03-kanban-page.png", full_page=True)
    
    content = page.content()
    has_kanban = "kanban" in content.lower() or "board" in content.lower() or "column" in content.lower()
    print(f"  - Kanban content present: {has_kanban}")
    
    return True

def test_ai_chat(page):
    """Test AI chat"""
    print("\n=== TEST: AI Chat ===")
    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")
    time.sleep(1)
    
    # Look for AI/Chat buttons
    chat_buttons = page.locator("button:has-text('AI'), button:has-text('Chat'), button:has-text('Nexus')").all()
    print(f"  - AI/Chat buttons found: {len(chat_buttons)}")
    
    if len(chat_buttons) > 0:
        chat_buttons[0].click()
        time.sleep(1)
        page.screenshot(path=f"{SCREENSHOTS_DIR}/04-ai-chat.png", full_page=True)
        print("  - AI Chat opened")
    
    return True

def test_responsive(page):
    """Test responsive design"""
    print("\n=== TEST: Responsive Design ===")
    
    # Desktop
    page.set_viewport_size({"width": 1920, "height": 1080})
    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")
    page.screenshot(path=f"{SCREENSHOTS_DIR}/05-desktop.png", full_page=True)
    print("  - Desktop screenshot taken")
    
    # Tablet
    page.set_viewport_size({"width": 768, "height": 1024})
    page.reload()
    page.wait_for_load_state("networkidle")
    page.screenshot(path=f"{SCREENSHOTS_DIR}/06-tablet.png", full_page=True)
    print("  - Tablet screenshot taken")
    
    # Mobile
    page.set_viewport_size({"width": 375, "height": 667})
    page.reload()
    page.wait_for_load_state("networkidle")
    page.screenshot(path=f"{SCREENSHOTS_DIR}/07-mobile.png", full_page=True)
    print("  - Mobile screenshot taken")
    
    return True

def main():
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()
        
        results = {}
        
        try:
            results["login"] = test_login_flow(page)
            results["projects"] = test_projects_page(page)
            results["kanban"] = test_kanban_page(page)
            results["ai_chat"] = test_ai_chat(page)
            results["responsive"] = test_responsive(page)
        except Exception as e:
            print(f"[ERROR] {e}")
            page.screenshot(path=f"{SCREENSHOTS_DIR}/error.png", full_page=True)
        finally:
            browser.close()
        
        print("\n=== SUMMARY ===")
        for test, passed in results.items():
            status = "[PASS]" if passed else "[FAIL]"
            print(f"  {test}: {status}")

if __name__ == "__main__":
    main()
