
* Tobi
    * Intro to socket.io library
        * Basic example of how it works (on the app side and on the client side)
            * Show initial branch before all work was completed? 
            * How easy it is to work with it
        * Show connection upgrade in network tab
    * Into to app
        * Go through package.json to highlight main packages for client & server
        * Run app locally w/ dynamo & redis-server
    * State management
        * Show state initialization
        * Show Reducer
        * Show the flow of a message coming in from back-end
* Alex
    * SocketManager
        * Creates Socket server and handles middleware, Redis connection, socket listeners, and calls dynamo endpoints
            * High-level overview of socket listeners
            * Mention Redis & how it works
        * Scaling w/ Redis
            * Integration with Socket.io (pub / sub) with socket.io-redis
                * Hashes – a data structure for storing a list of fields and values
                    * Session IDS and username/online status
                * Lists – a collection of Strings in the order they were added (stringify data).
                    * Used to store draw data (stringified objects)
        * Authentication
            * Attaching sessionID to socket on login
            * CORs ensures that we are only receiving from expected domains
            * Won’t be allowed to connect without username
                * Could check for username, or use a token system attached
                * Store this in localStorage
                * Show where this lives in the original http connection
            * Show middleware
    * DynamoDB
        * Looked at DocumentDB, was more of a graphQL replacement
        * User credentials, messages, room list
        * Show table layout in AWS
        * Show table & queries/puts
    * Terraform
        * Terraform init
        * Terraform plan
        * Terraform deploy
        * Resources
            * ALB - Needs to be non-default (greater than 60 seconds)
                * Can show normal DNS 
                * Also certificate
            * Redis / Elasticache server
            * ECR / ECS
            * Nat Instance for each AZ
            * Terraform.tf to store state file
    * CI/CD
        * Docker
        * Show deploy
    * Testing
        * Haven’t done any sort of load balancing, but 10% / 85% threshhole for CPU utilization is used
    * Sockets
        * Go from port 8080 (or 443) to port 80 (ws)