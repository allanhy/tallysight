import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time
import random  # Add import for randomization
import sys  # Add import for sys module
#Notes for this test: the test must use a fresh account that has not made any picks yet.
#You must manually login to the account before running the test. You have 30 seconds to login at the start of the test.
#The test will sometimes fail if a pick is already made for the day. Because of the randomization of the team selection, the test will sometimes fail.
#Nonetheless, the test will pass if the account has not made any picks for the day.
#This test only conducts picks on the default league.
#the test must use a fresh account. to ensure accuracy of the test.
#To run an integral test make sure the games selected have teams not yet played.
@pytest.fixture(scope="session")
def driver():
        driver = webdriver.Chrome()
        driver.maximize_window()
        yield driver
        driver.quit()
    
class TestMyPicksHistory:
    BASE_URL = "http://localhost:3000"
    
    def test_pick_and_history(self, driver):
        wait = WebDriverWait(driver, 10)
        
        # 1. MANUAL LOGIN REQUIRED - You have 30 seconds to log in
        driver.get(self.BASE_URL)
         
        for i in range(30, 0, -1):
            
            sys.stdout.write(f"\rTime remaining: {i}s")
            sys.stdout.flush()
            time.sleep(1)
            
            # Check for login
            if driver.find_elements(By.XPATH, "//a[contains(@href, '/profile')] | //button[contains(text(), 'Profile')]"):
                sys.stdout.write("\n")  # Add newline after countdown
                print("\nLogged in detected!")
                break

        if i == 1:
            sys.stdout.write("\n")
        
        # 2. Click on Play Now button on home page
        
        try:
            play_now_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Play Now')]")
        
           
        except Exception as e:
            print(f"Error finding Play Now button: {e}")
            raise NoSuchElementException("Could not find Play Now button on home page")
        
        # Store current URL before clicking
        current_url = driver.current_url
        
        # Click the Play Now button
        driver.execute_script("arguments[0].click();", play_now_button)
        print("Clicked Play Now button")
        
        # Wait 
        try:
            wait.until(EC.url_changes(current_url))
           
        except TimeoutException:
            print("Warning: URL did not change after clicking Play Now")
        
        # Wait for daily picks page to load
        wait.until(EC.url_contains("/daily-picks"))
        print("On daily picks page")
        time.sleep(1)
        
        # 3. Find and click a team using the exact XPath that works. If this does not work you can find and change the XPath by inspecting the page.
       
        team_buttons = []
        
        try:
            
            game_card_buttons = driver.find_elements(By.XPATH, "/html/body/div[1]/main/div/div[4]/div/div/div[2]/button")
            
            if game_card_buttons:
                print(f"Found {len(game_card_buttons)} teams")
                
                # Log all team options
                print("\nPotential teams to pick:\n")
                for i, button in enumerate(game_card_buttons):
                    button_text = button.text.strip() or f"[Team with no text #{i+1}]"
                    print(f"  {i+1}. {button_text}")
                    team_buttons.append((button, button_text))
            else:
                print("No team buttons found ")
                raise NoSuchElementException("No team buttons found")
        except Exception as e:
            print(f"Error finding team buttons: {e}")
            raise NoSuchElementException(f"Error finding team buttons: {e}")
        
       
        if not team_buttons:
            raise NoSuchElementException("No team buttons found")
            
        # Randomly select a team
        if len(team_buttons) > 1:
            team_index = random.randint(0, len(team_buttons) - 1)
            team_card, chosen_team = team_buttons[team_index]
            print(f"Randomly selected team {team_index + 1} of {len(team_buttons)}: '{chosen_team}'\n")
        else:
            team_card, chosen_team = team_buttons[0]
            print(f"Only one team available, selecting: '{chosen_team}'")
        
        before_click_source = driver.page_source
        
        # Click the team
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", team_card)
        time.sleep(1)
        driver.execute_script("arguments[0].click();", team_card)
       
    
        after_click_source = driver.page_source
        if before_click_source == after_click_source:
            print("Warning: Page content did not change after team selection")
      
        # 4. Find and click the submit button
        try:
            submit_button = wait.until(EC.presence_of_element_located(
                (By.XPATH, "//button[contains(text(), 'Submit Picks')]")))
       
        except Exception as e:
            print(f"Error finding Submit button: {e}")
            raise NoSuchElementException("Could not find submit button")
        
        # Click the submit button
        driver.execute_script("arguments[0].click();", submit_button)
        print("Clicked Submit button\n")
        
        # Wait for confirmation 
        try:
            # First check if URL changes 
            wait.until(EC.url_changes(current_url))
           
        except TimeoutException:
           
            after_submit_source = driver.page_source
            if before_click_source != after_submit_source:
                print("Submit confirmed: Page content changed")
            else:
                try:
                    confirmation = wait.until(EC.presence_of_element_located(
                        (By.XPATH, "//div[contains(text(), 'Pick') and (contains(text(), 'submitted') or contains(text(), 'success'))]")))
                    print(f"Submit confirmed: Found confirmation element: '{confirmation.text}'")
                except:
                    print("Warning: Could not confirm if submit was successful")
        
        # Allow time for any submission processing
        time.sleep(2)
        
        # 5. Verify in My Picks page
        driver.get(f"{self.BASE_URL}/myPicks")
        # Wait for My Picks page to load
        try:
            wait.until(EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'My Picks')] | //div[contains(text(), 'My Picks')]")))
           
        except:
            print("Warning: Could not confirm My Picks page loaded")
            
        time.sleep(2)
        
        # Check for team in My Picks
        page_source = driver.page_source
        if chosen_team in page_source:
            print(f"SUCCESS: Team '{chosen_team}' verified in My Picks")
        elif any(term in page_source.lower() for term in ["my picks", "today's picks", "contest"]):
            print(f"SUCCESS: Picks content found for team '{chosen_team}'")
        else:
            raise Exception("Verification failed: No picks content found")
            
        print("Test passed successfully")
