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

    stage('NPM Audit (non-blocking)') {
      steps {
        // Fast dependency vulnerability check for Node projects.
        // Won't fail the pipeline (prints issues if found).
        sh 'npm audit --audit-level=high || true'
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

    // OWASP Dependency-Check is commented out because NVD updates can be slow/rate-limited/maintenance.
    // Enable later when you have an NVD API key and stable updates.
    /*
    stage('OWASP Dependency Check (non-blocking)') {
      steps {
        script {
          try {
            dependencyCheck(
              additionalArguments: '--scan . --format HTML --format XML --data ./dc-data',
              odcInstallation: 'OWASP-DepCheck'
            )
            dependencyCheckPublisher(pattern: '**/dependency-check-report.xml')
          } catch (e) {
            currentBuild.result = 'UNSTABLE'
            echo "Dependency-Check failed (continuing pipeline): ${e}"
          }
        }
      }
    }
    */

    stage('Quality Gate') {
      steps {
        timeout(time: 15, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }
  }
}

