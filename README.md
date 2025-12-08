# Dawg-Tickets

The University of Georgia Athletic Association (UGAAA) would like to create a web application that allows students to trade and transfer game tickets between each other. This UGA Ticket Trading Web Application will enable users to exchange tickets for UGA sporting events, such as football, basketball, gymnastics, without money transactions. This application will focus strictly on trading and transferring, not selling, allowing users to swap tickets they already own for those to other events or seats, ensuring fairness and compliance with university policies. 

From this platform, users will be able to post tickets available for trade, search for others seeking trades, and securely connect through a verified account system (SSO). Users may also simply transfer tickets one way to their account of choice (similar to the current donation system, but with the additional option of selecting which peer receives the ticket)

It is the goal of this project to provide a functional web-based trading system that satisfies the UGAAA and student users. The project goals are:
- Provide a secure and accessible platform for users to list and trade UGA athletic tickets.
- Allow users to log in via SSO to ensure trades occur within the UGA community.
- Enable users to filter by sport, date, and seat section to find relevant trade offers.
- Offer a request and confirmation system allowing both parties to agree on a trade.
- Maintain a trade history and confirmation log for accountability.

The success of this project is measured by:
- Meeting all the functional and non-functional requirements (outlined in the Requirements Document).
- Achieving usability for at least 90% …
- Demonstrating the team’s ability to work through the software development lifecycles with understanding of its necessary components, while producing a working product and
deliverables.

## Implementation

# Environment Setup

To run this project, please create a `.env` file in the project root with the following content: (ordinarily, we would not share this information)

MONGO_URI=mongodb+srv://<yourRealUser>:<yourRealPassword>@<yourCluster>.mongodb.net/dawg-tickets?retryWrites=true&w=majority
JWT_SECRET=someSecretUsedForTokens
ADMIN_EMAILS=admin1@uga.edu,admin2@uga.edu   # or just one email you used
PORT=3000

# Running the program
npm install
node index.js
or: nodemon index.js

# Visit
http://localhost:3000 port to open the website

## Tech Stack
HTML, CSS, JavaScript, Node.js, MongoDB

## Tentative UI Design
<img src="https://github.com/Krisha052/Dawg-Tickets/blob/main/public/images/Login%20Page.png?raw=true">
<img src="https://github.com/Krisha052/Dawg-Tickets/blob/main/public/images/Sign-up%20Page.png?raw=true">
<img src="https://github.com/Krisha052/Dawg-Tickets/blob/main/public/images/Navigation%20Page.png?raw=true">
<img src="https://github.com/Krisha052/Dawg-Tickets/blob/main/public/images/Home%20Page.png?raw=true">
<img src="https://github.com/Krisha052/Dawg-Tickets/blob/main/public/images/Trade%20Creation%20Page.png?raw=true">
<img src="https://github.com/Krisha052/Dawg-Tickets/blob/main/public/images/Current%20Trades.png?raw=true">
<img src="https://github.com/Krisha052/Dawg-Tickets/blob/main/public/images/Trade%20History%20Page.png?raw=true">
