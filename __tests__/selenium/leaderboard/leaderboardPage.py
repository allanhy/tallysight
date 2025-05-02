import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

@pytest.fixture
def setup():
    driver = webdriver.Chrome()
    driver.get('http://localhost:3000/leaderboards')
    driver.maximize_window()
    yield driver
    driver.quit()

def test_signup_buttons(setup):
    driver = setup

    # Wait for "Sign Up" button to be visible
    sign_up_button = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.CLASS_NAME, "sign-up-button"))
    )

    assert sign_up_button.is_displayed(), "Sign Up button not visible"

    # Click "Sign Up" button 
    sign_up_button.click()
    
    time.sleep(5)

    # Wait until the URL contains the link
    WebDriverWait(driver, 10).until(
        EC.url_contains("redirect_url=%2Fleaderboards")
    )
    print(f"Successfully navigated to {driver.current_url}")

    
def test_login_buttons(setup):
    driver = setup

    # Wait for "Log In" button to be visible
    log_in_button = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.CLASS_NAME, "sign-in-button"))
    )

    assert log_in_button.is_displayed(), "Log In button not visible"

    # Click "Log In" button
    log_in_button.click()
    
    time.sleep(5)

    # Wait until the URL contains the link for log in
    WebDriverWait(driver, 10).until(
        EC.url_contains("redirect_url=%2Fleaderboards")
    )
    print(f"Successfully navigated to {driver.current_url}")

