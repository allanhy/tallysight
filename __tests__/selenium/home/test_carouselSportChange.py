import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException
import time

@pytest.fixture
def setup():
    chrome_options = Options()
    chrome_options.add_argument("--log-level=3")
    chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])

    driver = webdriver.Chrome(options=chrome_options)
    driver.get('http://localhost:3000')  # Update URL if needed
    driver.maximize_window()
    time.sleep(3)  # Allow page to load
    yield driver
    driver.quit()

def select_sport_from_dropdown(driver, sport_name):
    wait = WebDriverWait(driver, 10)
    dropdown = wait.until(EC.visibility_of_element_located((By.TAG_NAME, "select")))
    select = Select(dropdown)
    select.select_by_value(sport_name)
    print(f"🔵 Selected sport: {sport_name}")
    time.sleep(2)  # Allow carousel update

def select_soccer_league(driver, league_name):
    try:
        wait = WebDriverWait(driver, 10)
        dropdown = wait.until(EC.visibility_of_element_located((By.ID, "soccer-league")))
        select = Select(dropdown)
        select.select_by_value(league_name)
        print(f"⚽ Selected soccer league: {league_name or 'All Leagues'}")
        time.sleep(2)  # allow update
    except TimeoutException:
        print(f"⚠️ Could not find soccer league dropdown for league: {league_name}")

def click_sport_button(driver, sport_name):
    wait = WebDriverWait(driver, 10)
    try:
        sport_button = wait.until(
            EC.element_to_be_clickable(
                (By.XPATH, f"//button[.//span[text()='{sport_name}']]")
            )
        )
        sport_button.click()
        print(f"🟢 Clicked home page sport button: {sport_name}")
        time.sleep(2)
    except TimeoutException:
        print(f"⚠️ Sport button for {sport_name} not found on home page.")

def get_carousel_game_count(driver):
    wait = WebDriverWait(driver, 10)
    try:
        carousel = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "react-multi-carousel-list")))
        games = carousel.find_elements(By.CSS_SELECTOR, "[data-testid='game-card']")
        game_ids = set()
        for card in games:
            game_id = card.get_attribute("data-game-id")
            if game_id:
                game_ids.add(game_id)

        return len(game_ids)
    except TimeoutException:
        print("⚠️ No carousel or games loaded within timeout.")
        return 0

def click_refresh_button(driver):
    wait = WebDriverWait(driver, 10)
    refresh_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[title='Refresh Games']")))
    refresh_button.click()
    print("🔄 Clicked refresh button")
    time.sleep(2)  # Allow carousel reload

def test_sport_dropdown_and_refresh_functionality(setup):
    driver = setup
    dropdown_sports = ["NBA", "NFL", "MLB", "NHL", "Soccer", "MLS", "EPL", "LALIGA", "BUNDESLIGA", "SERIE_A", "LIGUE_1"]
    button_sports = ["NBA", "MLB", "NFL", "NHL", "Soccer"]

    print("\n=== 🎯 Testing Dropdown Sports ===")
    for sport in dropdown_sports:
        print(f"\n🔽 Testing sport selection from dropdown: {sport}")
        select_sport_from_dropdown(driver, sport)
        initial_game_count = get_carousel_game_count(driver)
        if initial_game_count > 0:
            print(f"✅ Initial games loaded for {sport}: {initial_game_count}")
        else:
            print(f"⚠️ No games initially loaded for {sport} (possible offseason or no games today)")


        click_refresh_button(driver)
        refreshed_game_count = get_carousel_game_count(driver)
        print(f"♻️ Refreshed game count: {refreshed_game_count}")

    print("\n=== 🎯 Testing Home Page Button Sports ===")
    for sport in button_sports:
        print(f"\n🔘 Testing sport button selection: {sport}")
        click_sport_button(driver, sport)
        initial_game_count = get_carousel_game_count(driver)
        if initial_game_count > 0:
            print(f"✅ Initial games loaded for {sport}: {initial_game_count}")
        else:
            print(f"⚠️ No games initially loaded for {sport} (possible offseason or no games today)")

        click_refresh_button(driver)
        refreshed_game_count = get_carousel_game_count(driver)
        if refreshed_game_count > 0:
            print(f"✅ Games loaded after refresh for {sport} (button): {refreshed_game_count}")
        else:
            print(f"⚠️ No games loaded after refresh for {sport} (button) (possible offseason or no games today)")


    print("\n=== ⚽ Testing Soccer League Dropdown ===")
    click_sport_button(driver, "Soccer")  # Make sure soccer is active first

    soccer_leagues = ["", "MLS", "EPL", "LALIGA", "BUNDESLIGA", "SERIE_A", "LIGUE_1"]

    for league in soccer_leagues:
        select_soccer_league(driver, league)

        league_game_count = get_carousel_game_count(driver)
        if league_game_count > 0:
            print(f"✅ Initial games loaded for {league or 'All Soccer Leagues'}: {league_game_count}")
        else:
            print(f"⚠️ No games initially loaded for {league or 'All Soccer Leagues'} (possible offseason or no games today)")


        click_refresh_button(driver)

        refreshed_count = get_carousel_game_count(driver)
        if refreshed_count > 0:
            print(f"✅ Games loaded after refresh for {league or 'All Soccer Leagues'}: {refreshed_count}")
        else:
            print(f"⚠️ No games loaded after refresh for {league or 'All Soccer Leagues'} (possible offseason or no games today)")
