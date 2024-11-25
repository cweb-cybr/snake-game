pipeline 
{
    agent none // The pipeline does not have a default agent; each stage specifies its own agent.

    stages 
    {
        stage('Cloning Git Repository') 
        {
            // Cloning the files from github to the Appserver.
            agent 
            {
                // Specifies which server this stage is run on.
                label 'final-project-appserver'
            }
            steps 
            {
                // Checkout the source code from the Git repository defined in Jenkins
                checkout scm
            }    
        }
          
        stage('Security Testing')
        {
            parallel
            {
                stage('Static Security Testing With Synk') 
                {
                    // Static testing of the third party code from github.
                    agent { label 'final-project-appserver' }
                    steps 
                    {
                        script 
                        {
                            
                            snykSecurity(
                                snykInstallation: 'Snyk', // Reference to the configured Snyk installation in Jenkins.
                                snykTokenId: 'SnykID', // Use the provided Snyk API token.
                                severity: 'critical' // Set the severity level for not allowing code to continue.
                            )
                        }
                    }
                }

                stage('Dynamic Security Testing With SonarQube') 
                {
                    // Dynamic testing of the Developer's code with SonarQube.
                    agent { label 'final-project-appserver' }
                    steps 
                    {
                        script 
                        {
                            // Perform dynamic code analysis using SonarQube
                            def scannerHome = tool name: 'Sonar'                     
                            withSonarQubeEnv('sonarqube') // Use the SonarQube environment defined in Jenkins
                            { 
                                sh """
                                    ${scannerHome}/bin/sonar-scanner \
                                    -Dsonar.projectKey=final-snakegame \
                                    -Dsonar.sources=.
                                """
                            }
                        }
                    }
                }    
            }
        }

        stage('Build and Tag Image') 
        {
            // Build Docker image with the tag "Latest".
            agent { label 'final-project-appserver' }
            steps 
            {
                script 
                {
                    // Build a Docker image for the application
                    def app = docker.build('cybr3120/snakegame') // Build the image with the specified name
                    app.tag("latest") // Tag the image with 'latest'
                }
            }
        }

        stage('Post Image to DockerHub') 
        {    
            // Push the new Docker image to DockerHub with the tag Latest.
            agent { label 'final-project-appserver' }
            steps 
            {
                script 
                {   // Authenticate with DockerHub and push the built Docker image
                    
                    docker.withRegistry('https://registry.hub.docker.com', 'DockerhubID') 
                    {
                        def app = docker.image('cybr3120/snakegame') // Reference the Docker image
                        app.push("latest") // Push the image with the 'latest' tag
                    }
                }
            }
        }

        stage('Prepare Environment') 
        {
            agent { label 'final-project-appserver' }
            steps 
            {
                script 
                {   // Find and stop any Docker container using port 80 so there isn't any conflicts when deploying.
                    
                    sh '''
                        CONTAINER_ID=$(docker ps -q --filter "publish=80")
                        if [ -n "$CONTAINER_ID" ]; then
                            echo "Stopping container using port 80: $CONTAINER_ID"
                            docker stop $CONTAINER_ID
                            docker rm $CONTAINER_ID
                        else
                            echo "No container using port 80."
                        fi
                    '''
                }
            }
        }

        stage('Deployment') 
        {    
            // Deploy the Image.
            agent { label 'final-project-appserver' }
            steps 
            {
                // Deploy the application using Docker Compose
                sh "docker-compose down"    // Stop any existing containers defined in the Docker Compose file
                sh "docker-compose up -d"   // Start the containers in detached mode
            }
        }
    }
}