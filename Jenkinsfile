pipeline {
  agent any

  environment {
    DOCKERHUB_USERNAME = 'hahaha555'
    APP_NAME          = 'devops-delight-shop'
    IMAGE_TAG         = "${BUILD_NUMBER}"
  }

  tools {
    nodejs 'node-20-18-2'
  }

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        echo "Installing dependencies..."
        sh '''
          set -euxo pipefail
          node -v
          npm -v
          npm ci
        '''
      }
    }

    stage('Test + Coverage') {
      steps {
        sh '''
          set -euxo pipefail
          npm run test:cov
          test -f coverage/lcov.info
          ls -lah coverage/lcov.info
        '''
      }
    }

    stage('OWASP Dependency-Check') {
      steps {
        withCredentials([string(credentialsId: 'nvd-api-key', variable: 'NVD_API_KEY')]) {
          dependencyCheck additionalArguments: "--nvdApiKey ${NVD_API_KEY} --scan ./ --format HTML --format XML", odcInstallation: 'OWASP-DepCheck'
        }
        dependencyCheckPublisher pattern: 'dependency-check-report.xml'
      }
    }

    stage('NPM Audit (non-blocking)') {
      steps {
        sh '''
          set +e
          npm audit --audit-level=high
          exit 0
        '''
      }
    }

    stage('SonarQube Analysis') {
      steps {
        script {
          def scannerHome = tool 'sonar-scanner'

          withSonarQubeEnv('SonarQube') {
            sh """
              set -euxo pipefail

              ${scannerHome}/bin/sonar-scanner \
                -Dsonar.projectKey=devops-delight-shop \
                -Dsonar.projectName=devops-delight-shop \
                -Dsonar.sources=src \
                -Dsonar.tests=src/test,__tests__ \
                -Dsonar.test.inclusions=**/*.test.tsx,**/*.test.ts,**/*.test.js \
                -Dsonar.exclusions=src/test/**,__tests__/** \
                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                -Dsonar.coverage.exclusions=src/main.tsx,**/*.config.js,**/*.config.ts,src/components/ui/**,src/integrations/**
            """
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

    stage('Docker Build & Push (main only)') {
      steps {
        script {
          def fullImage = "${DOCKERHUB_USERNAME}/${APP_NAME}"

          docker.withRegistry('', 'docker-hub-creds') {
            def img = docker.build("${fullImage}:${IMAGE_TAG}")
            img.push()
            img.push('latest')
          }
        }
      }
    }

    stage('DAST (OWASP ZAP)') {
      steps {
        script {
          def targetUrl = "http://100.65.215.118" 
          
          echo "Waiting for ArgoCD to apply the latest deployment..."
          sleep time: 30, unit: 'SECONDS'
          
          echo "Initiating OWASP ZAP Dynamic Vulnerability Scan on ${targetUrl}..."
          
          sh """
            docker run --rm ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
              -t ${targetUrl} \
              -I
          """
        }
      }
    }
  }

  post {
    always {
      echo "Build completed: ${currentBuild.currentResult}"
      archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: true
    }
  }
}
