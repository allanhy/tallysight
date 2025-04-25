import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

@pytest.fixture
def setup():
    driver = webdriver.Chrome()
    driver.get('http://localhost:3000') # your localhost address
    driver.maximize_window()
    time.sleep(10)
    yield driver
    driver.quit()


def text_exists_anywhere(driver, target_text):
    try:
        xpath = f"//*[contains(text(), \"{target_text}\")]"
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, xpath))
        )
        return True
    except Exception:
        return False

def test_upcoming_text_anywhere(setup):
    driver = setup
    sports = ['NBA', 'MLB', 'NHL', 'Soccer', 'NFL']
    for sport in sports:
        assert text_exists_anywhere(driver, sport), f"'{sport}' not found anywhere on the page."
    
    assert text_exists_anywhere(driver, "Featured Contest"), "'Featured Contest' not found anywhere in the page."
    assert text_exists_anywhere(driver, "Upcoming Contest"), "'Upcoming Contest' not found anywhere in the page."
    assert text_exists_anywhere(driver, "Today's"), "'Today's' not found anywhere in the page."
    assert text_exists_anywhere(driver, "Tomorrow's"), "'Tomorrow's' not found anywhere in the page."
    assert text_exists_anywhere(driver, "Play Now"), "'Play Now' not found anywhere in the page."
    assert text_exists_anywhere(driver, "Preview Games"), "'Preview Games' not found anywhere in the page."
    
def test_button_click_daily_contest(setup):
    driver = setup

    # Click "Play Now" under the Featured Contest section
    preview_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//div[text()='Featured Contest']/following::button[contains(text(), 'Play Now')]"))
    )
    preview_button.click()

    # Wait to make sure on page
    WebDriverWait(driver, 10).until(
        EC.url_contains("/daily-picks")
    )
    current_url = driver.current_url
    assert "/daily-picks" in current_url, "URL did not change to /daily-picks after clicking Preview Games."

def test_button_click_upcoming_contest(setup):
    driver = setup

    # Click "Preview Games" under the Upcoming Contest section
    preview_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//div[text()='Upcoming Contest']/following::button[contains(text(), 'Preview Games')]"))
    )
    preview_button.click()

    # Wait to ensure navigation occurs
    WebDriverWait(driver, 10).until(
        EC.url_contains("/tomorrow-picks")
    )
    current_url = driver.current_url
    assert "/tomorrow-picks" in current_url, "URL did not change to /tomorrow-picks after clicking Preview Games."
