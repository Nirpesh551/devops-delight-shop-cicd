pipeline {
  agent any

  tools {
    nodejs 'node-20-18-2'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build & Install') {
      steps {
        echo "Installing dependencies..."
        sh 'node -v'
        sh 'npm -v'
        sh 'npm ci || npm install'
      }
    }

    stage('SonarQube Analysis') {
      steps {
        script {
          def scannerHome = tool 'sonar-scanner'
          withSonarQubeEnv('SonarQube') {
            sh """
              ${scannerHome}/bin/sonar-scanner \
                -Dsonar.projectKey=devops-delight-shop \
                -Dsonar.sources=.
            """
          }
        }
      }
    }

    stage('OWASP Dependency Check') {
      steps {
        script {
          try {
            dependencyCheck(
              additionalArguments: '--scan . --format HTML --format XML --data ./dc-data',
              odcInstallation: 'OWASP-DepCheck'
            )

            dependencyCheckPublisher(pattern: '**/dependency-check-report.xml')
          } catch (err) {
            // Mark build as UNSTABLE but continue the pipeline
            currentBuild.result = 'UNSTABLE'
            echo "OWASP Dependency-Check failed (continuing pipeline). Reason: ${err}"
          }
        }
      }
    }

    stage('Quality Gate') {
      steps {
        timeout(time: 15, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }
  }
}

