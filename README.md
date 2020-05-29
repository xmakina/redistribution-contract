# Clarity Mass Redistribution
Submission to Clarity Hackathon Level 2

# Purpose
A pot for redistrubting funds. Inspired by [@hyperlink@snouts.online](https://snouts.online/@hyperlink)'s "Mastodon Community Stimulus Redistribution Fund", the main issue was in sending the donated amounts to the recipients. This contract would trivialise this issue while still maintaining 100% transparency.
This is also an example of cross contract communication with the endless-list contract handling adding new recipients to the list

# Limitations
Because the @blockstack/clarity framework cannot support STX transactions, the full test suite has not been possible. Hopefully part 2 of the hackathon can help us address this!

# Demonstration
* Deploy the contract
* Add several beneficiaries
* Donate some stacks
* Ping the endless contract for the number of pages
* Submit the pages 10 at a time for redistribution
