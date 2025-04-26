import { NextResponse } from "next/server";
import { getTeamAbbreviation, getTeamLogo } from "./fetchTeamData";

import { BASE_URLS } from "./baseUrls";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dayParam = searchParams.get("day");
    const selectedSport = searchParams.get("sport")?.toUpperCase();
    const specificDateParam = searchParams.get("specificDate");

    if (specificDateParam) {
      const validDateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!validDateRegex.test(specificDateParam)) {
        return NextResponse.json(
          { games: [], message: "Invalid date format. Use YYYY-MM-DD." },
          { status: 400 }
        );
      }
    }
    
    if (!selectedSport || !BASE_URLS[selectedSport]) {
      return NextResponse.json(
        {
          games: [],
          message:
            "Invalid sport selected. Choose NBA, MLB, NFL, NHL, or Soccer League.",
        },
        { status: 400 }
      );
    }

    const BASE_URL = BASE_URLS[selectedSport];

    // Calculate dates
    const now = new Date();
    const estNow = new Date(
      now.toLocaleString("en-US", { timeZone: "America/New_York" })
    );
    const tomorrow = new Date(estNow);
    tomorrow.setDate(estNow.getDate() + 1);

    // Format dates for API
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}${month}${day}`;
    };

    // Declare variables before using them
    let dateStr: string;
    let targetDate: string;

    // If a specific date is requested, use that
    if (specificDateParam) {
      // specificDateParam should be in format YYYY-MM-DD
      const [year, month, day] = specificDateParam.split("-").map(Number);
      dateStr = `${year}${String(month).padStart(2, "0")}${String(day).padStart(
        2,
        "0"
      )}`;
      targetDate = specificDateParam;
      console.log(
        `Using specific date: ${specificDateParam}, formatted as: ${dateStr}`
      );
    } else {
      // Otherwise use today or tomorrow
      dateStr =
        dayParam === "tomorrow" ? formatDate(tomorrow) : formatDate(estNow);
      targetDate =
        dayParam === "tomorrow"
          ? tomorrow.toLocaleDateString("en-CA")
          : estNow.toLocaleDateString("en-CA");
    }

    // Use the calendar endpoint
    const url = `${BASE_URL}/scoreboard?dates=${dateStr}`;
    // console.log('Fetching URL:', url);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.error(`API Error: ${response.status} for URL: ${url}`);
      return NextResponse.json({
        games: [],
        message: `No games found for ${dayParam || "today"}`,
      });
    }

    const data = await response.json();

    if (!data.events || data.events.length === 0) {
      return NextResponse.json({
        games: [],
        message: `No games scheduled for ${dayParam || "today"}`,
      });
    }

    const games = await Promise.all(
      data.events.map(async (game: any) => {
        try {
          const competition = game.competitions[0];
          const homeTeam = competition.competitors.find(
            (t: any) => t.homeAway === "home"
          )?.team;
          const awayTeam = competition.competitors.find(
            (t: any) => t.homeAway === "away"
          )?.team;

          // Debug logging for status
          console.log('Raw status data for game:', {
            gameId: game.id,
            teams: `${homeTeam?.name} vs ${awayTeam?.name}`,
            statusType: competition.status?.type,
            statusDetail: competition.status,
          });

          // Get the full date string in ISO format
          const gameDate = game.date;

          // Convert UTC date to EST for display
          const utcDate = new Date(gameDate);

          // Format the time for display in EST
          const displayTime = utcDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZone: "America/New_York",
          });

          // Get the EST date string for proper date grouping
          const estDateString = utcDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            timeZone: "America/New_York",
          });

          // Format date for database (YYYY-MM-DD)
          const dbDateFormat = utcDate.toLocaleDateString("en-CA", {
            timeZone: "America/New_York",
          });

          // Format time for database (HH:MM:SS)
          const dbTimeFormat = utcDate.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: "America/New_York",
          });

          // OVERRIDE: Force all games to be on target date but keep original times
          const forcedDate = new Date(targetDate);

          // Extract the original time components
          const originalTime = dbTimeFormat;
          const [hours, minutes, seconds] = originalTime.split(":").map(Number);

          // Set the time on our forced date
          forcedDate.setHours(hours, minutes, seconds);

          // Format for display with the original time
          const forcedDisplayTime = forcedDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

          const forcedDateString = forcedDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });

          const forcedDbDate = targetDate;
          const forcedDbTime = originalTime;

          const homeAbbreviation = await getTeamAbbreviation(
            homeTeam?.name,
            selectedSport
          );
          const awayAbbreviation = await getTeamAbbreviation(
            awayTeam?.name,
            selectedSport
          );
          const spreadDetails = competition.odds?.[0]?.details || "N/A";

          // Add debug logging for odds data
          console.log('Odds data for game:', {
            gameId: game.id,
            teams: `${homeTeam?.name} vs ${awayTeam?.name}`,
            rawOdds: competition.odds,
            spreadDetails,
            homeTeamOdds: competition.odds?.[0]?.homeTeamOdds,
            awayTeamOdds: competition.odds?.[0]?.awayTeamOdds,
            allOddsDetails: competition.odds?.map((odd: any) => ({
              details: odd.details,
              homeTeamOdds: odd.homeTeamOdds,
              awayTeamOdds: odd.awayTeamOdds,
              drawOdds: odd.drawOdds
            }))
          });

          // Default spreads
          let homeTeamSpread = "N/A";
          let awayTeamSpread = "N/A";

          // Check if this is a soccer match
          const isSoccer = selectedSport.toLowerCase().includes('soccer') || 
                          ['MLS', 'EPL', 'LALIGA', 'BUNDESLIGA', 'SERIE_A', 'LIGUE_1'].includes(selectedSport);

          // Determine game status
          const gameStatus = competition.status?.type?.name || "Scheduled";
          const isGameFinished = gameStatus === "STATUS_FINAL" || 
                               gameStatus === "STATUS_FULL_TIME" || 
                               gameStatus === "STATUS_ENDED" ||
                               gameStatus === "STATUS_COMPLETED";

          // Check if game is in progress
          const isGameInProgress = gameStatus === "STATUS_IN_PROGRESS" || 
                                 gameStatus === "STATUS_HALFTIME" || 
                                 gameStatus === "STATUS_LIVE" ||
                                 gameStatus === "STATUS_FIRST_HALF" ||
                                 gameStatus === "STATUS_SECOND_HALF" ||
                                 gameStatus === "STATUS_ACTIVE";

          // If game is finished, update the schedule to show "Final"
          const displaySchedule = isGameFinished ? "Final" : forcedDisplayTime;

          if (!isSoccer && spreadDetails !== "N/A") {
            const spreadParts = spreadDetails
              .split(",")
              .map((s: string) => s.trim());

            spreadParts.forEach(
              (part: { split: (arg0: string) => [any, any] }) => {
                const [abbr, spreadValue] = part.split(" ");

                if (abbr === homeAbbreviation) {
                  homeTeamSpread = spreadValue;
                  awayTeamSpread = spreadValue.startsWith("+")
                    ? `-${spreadValue.slice(1)}`
                    : `+${spreadValue.slice(1)}`;
                } else if (abbr === awayAbbreviation) {
                  awayTeamSpread = spreadValue;
                  homeTeamSpread = spreadValue.startsWith("+")
                    ? `-${spreadValue.slice(1)}`
                    : `+${spreadValue.slice(1)}`;
                }
              }
            );
          } else if (isSoccer) {
            // For soccer matches, use team form and statistics
            const homeTeamData = competition.competitors.find((t: any) => t.homeAway === "home");
            const awayTeamData = competition.competitors.find((t: any) => t.homeAway === "away");
            
            // Get team forms (e.g., "WWDLW")
            const homeForm = homeTeamData?.form || '';
            const awayForm = awayTeamData?.form || '';
            
            // Calculate form score (W=3, D=1, L=0)
            const calculateFormScore = (form: string) => {
              return form.split('').reduce((score, result) => {
                if (result === 'W') return score + 3;
                if (result === 'D') return score + 1;
                return score;
              }, 0);
            };
            
            const homeFormScore = calculateFormScore(homeForm);
            const awayFormScore = calculateFormScore(awayForm);
            
            // Get team positions if available
            const homePosition = parseInt(homeTeamData?.stats?.find((s: any) => s.name === 'rank')?.value || '0');
            const awayPosition = parseInt(awayTeamData?.stats?.find((s: any) => s.name === 'rank')?.value || '0');
            
            // Calculate spread based on form difference
            const formDifference = homeFormScore - awayFormScore;
            const positionDifference = awayPosition - homePosition; // Higher position number means lower rank
            
            // Combine form and position differences to determine spread
            // Form difference has more weight (0.5 goals per 3 points difference)
            // Position difference has less weight (0.25 goals per 5 positions difference)
            const formSpread = (formDifference / 6);
            const positionSpread = (positionDifference / 20);
            const totalSpread = formSpread + positionSpread;
            
            // Round to nearest 0.5 and ensure minimum 0.5 spread
            const roundedSpread = Math.max(0.5, Math.round(Math.abs(totalSpread) * 2) / 2);
            
            if (totalSpread > 0) {
              // Home team is favorite
              homeTeamSpread = `-${roundedSpread}`;
              awayTeamSpread = `+${roundedSpread}`;
            } else {
              // Away team is favorite
              homeTeamSpread = `+${roundedSpread}`;
              awayTeamSpread = `-${roundedSpread}`;
            }
            
            // Add form to the debug log
            console.log('Soccer match spread calculation:', {
              gameId: game.id,
              teams: `${homeTeam?.name} vs ${awayTeam?.name}`,
              homeForm,
              awayForm,
              homeFormScore,
              awayFormScore,
              homePosition,
              awayPosition,
              formDifference,
              positionDifference,
              totalSpread,
              roundedSpread,
              finalSpreads: { home: homeTeamSpread, away: awayTeamSpread }
            });
          }

          const awayTeamOdds = competition.odds?.[0]?.awayTeamOdds || {};
          const homeTeamOdds = competition.odds?.[0]?.homeTeamOdds || {};

          return {
            id: game.id,
            homeTeam: {
              name: homeTeam?.name || "TBD",
              score: competition.competitors.find((t: any) => t.homeAway === "home")?.score || "0",
              spread: homeTeamSpread || "N/A",
              isFavorite: homeTeamOdds.favorite || false,
              isUnderdog: homeTeamOdds.underdog || false,
              logo: await getTeamLogo(homeTeam?.name, selectedSport),
            },
            awayTeam: {
              name: awayTeam?.name || "TBD",
              score: competition.competitors.find((t: any) => t.homeAway === "away")?.score || "0",
              spread: awayTeamSpread || "N/A",
              isFavorite: awayTeamOdds.favorite || false,
              isUnderdog: awayTeamOdds.underdog || false,
              logo: await getTeamLogo(awayTeam?.name, selectedSport),
            },
            homeTeamAbbreviation: await getTeamAbbreviation(
              homeTeam?.name,
              selectedSport
            ),
            awayTeamAbbreviation: await getTeamAbbreviation(
              awayTeam?.name,
              selectedSport
            ),
            gameTime: displaySchedule,
            fullDate: gameDate,
            estDate: forcedDateString,
            dbDate: forcedDbDate,
            dbTime: forcedDbTime,
            status: competition.status?.type?.name || "N/A",
            isFinished: isGameFinished,
            isInProgress: isGameInProgress,
            forcedDate: true,
            venue: competition.venue?.fullName || "TBD",
            broadcast: competition.broadcasts?.[0]?.names?.[0] || "TBD",
            homeScore:
              competition.competitors.find((t: any) => t.homeAway === "home")
                ?.score || "0",
            awayScore:
              competition.competitors.find((t: any) => t.homeAway === "away")
                ?.score || "0",
            period: competition.status?.period || 0,
            clock: competition.status?.displayClock || "",
          };
        } catch (e) {
          console.error("Error processing game:", e);
          return null;
        }
      })
    ).then((results) => results.filter(Boolean));

    console.log(`Found ${games.length} games for date: ${dateStr}`);

    return NextResponse.json({
      games,
      message:
        games.length > 0
          ? `Games retrieved successfully for ${dayParam || "today"}`
          : `No games scheduled for ${dayParam || "today"}`,
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      {
        games: [],
        message: "Error fetching games",
      },
      { status: 500 }
    );
  }
}
