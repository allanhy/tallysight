import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time

@pytest.fixture
def setup():
    chrome_options = Options()
    chrome_options.add_argument("--log-level=3")
    chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])

    driver = webdriver.Chrome(options=chrome_options)
    driver.get('http://localhost:3000')  # your localhost address
    driver.maximize_window()
    time.sleep(10)
    yield driver
    driver.quit()

def click_sport_button(driver, sport_name):
    print(f"🔵 Clicking sport: {sport_name}")
    sport_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, f"//span[contains(text(), '{sport_name}')]"))
    )
    sport_button.click()
    time.sleep(1)  # small wait to allow games to update

def get_upcoming_contest_title(driver):
    try:
        title_element = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//div[text()='Upcoming Contest']/following::h1[1]"))
        )
        return title_element.text
    except:
        return "Unknown League"
    
def test_tomorrow_contest_buttons_show_correct_games(setup):
    driver = setup

    sports = ['NBA', 'MLB', 'NFL', 'NHL', 'Soccer']  # Sports to test

    for sport in sports:
        print(f"\n🎯 Testing sport selection for Tomorrow's games: {sport}")
        click_sport_button(driver, sport)

        featured_title = get_upcoming_contest_title(driver)
        print(f"📢 Upcoming Contest Title after selecting {sport}: {featured_title}")

        # Click "Preview Games" under Upcoming Contest
        print(f"🟡 Clicking 'Preview Games' for {sport}")
        preview_games_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//div[text()='Upcoming Contest']/following::button[contains(text(), 'Preview Games')]"))
        )
        preview_games_button.click()
        print(f"✅ Clicked 'Preview Games' for {sport}")

        # Wait until redirected
        WebDriverWait(driver, 10).until(
            EC.url_contains("/tomorrow-picks")
        )
        print(f"🟢 Redirected to /tomorrow-picks after selecting {sport}")

        # Ensure page body loads
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        time.sleep(2)

        # ✅ Check that the correct games are shown
        page_text = driver.find_element(By.TAG_NAME, "body").text

        if sport == 'Soccer':
            if any(league in page_text for league in ["MLS", "EPL", "LALIGA", "BUNDESLIGA", "SERIE_A", "LIGUE_1"]):
                print(f"✅ Soccer league detected successfully on /tomorrow-picks page")
            else:
                raise AssertionError(f"❌ Soccer games not found after clicking Preview Games for {sport}")
        else:
            if sport in page_text:
                print(f"✅ {sport} games found successfully on /tomorrow-picks page")
            else:
                raise AssertionError(f"❌ {sport} games not found after clicking Preview Games")

        # Go back to contests page for next sport
        driver.get('http://localhost:3000')
        time.sleep(2)
        
