# Poker Score Tracker

## User Story
Frank and his friends play a poker game called "flips," where they need to track wins and losses for each player. The app will allow adding players, tracking their scores, and saving the data for long-term analysis.

## Features
1. **Add Players**: Add up to 9 players for a game session.
2. **Track Scores**: Display the current score for each player.
3. **Score Adjustment**: Buttons to adjust scores with +1, +2, and -1.this button relate to the amount of wins, +1 = 1 win, +2 = 2 wins and -1 should do the exact opossit of +1, as in most times this is used in the even an error was made.
4. **Data Persistence**: Save scores between sessions for long-term tracking.
5. **Reset Scores**: Option to reset scores for a new game session.
6. Winner's Gain: The winning player receives the monetary value multiplied by the number of losing players.
Losers' Loss: Each losing player has the monetary value deducted from their total.
This logic should ensure that if Player 1 wins a $100 game with 8 other players, Player 1's total increases by $800 (8 * $100), and each of the 8 other players' totals decrease by $100.

## Roadmap
- **Initial Version**: Basic functionality as described in the features.
- **Future Enhancements**:
  - Player statistics and history.
  - Graphical representation of scores over time.
  - User authentication for secure data access.

## Changelog
- **v1.0**: Initial release with basic features.
