import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

@pytest.fixture
def setup():
    driver = webdriver.Chrome()
    driver.get('http://localhost:3000') # your localhost address
    driver.maximize_window()
    time.sleep(2)
    yield driver
    driver.quit()

def test_best_pick_button(setup):
    driver = setup

    time.sleep(1)

    # Click "Preview Game" under the "Upcoming Contest" section
    preview_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((
            By.XPATH,
            "//div[text()='Upcoming Contest']/following::button[contains(text(), 'Preview Game')]"
        ))
    )
    preview_button.click()

    time.sleep(2)

    # Wait for page to load
    WebDriverWait(driver, 15).until(EC.url_contains("/tomorrow-picks"))
    assert "/tomorrow-picks" in driver.current_url, "Failed to navigate to /tomorrow-picks"

    time.sleep(2)

    # Find all "Best Pick ★" buttons
    buttons = WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.XPATH, "//button[contains(text(), 'Best Pick ★')]"))
    )

    time.sleep(1)

    # Click the first Best Pick button
    buttons[0].click()
    time.sleep(1)

    # Move mouse off the button
    body = driver.find_element(By.TAG_NAME, "body")
    ActionChains(driver).move_to_element(body).move_by_offset(0, 0).perform()
    time.sleep(1)

    # Wait for the button to get the "selected" class
    def best_pick_is_selected(driver):
        try:
            updated_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Best Pick ★')]")
            class_attr = updated_buttons[0].get_attribute("class")
            print("Class attribute of button[0]:", class_attr)
            return "text-yellow-500" in class_attr
        except Exception as e:
            print("Exception during class check:", e)
            return False

    WebDriverWait(driver, 10).until(best_pick_is_selected)

    time.sleep(2)

    selected_class = driver.find_elements(By.XPATH, "//button[contains(text(), 'Best Pick ★')]")[0].get_attribute("class")
    assert "text-yellow-500" in selected_class, "Button did not become selected"
