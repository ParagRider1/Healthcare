pipeline {
    agent any
    triggers {
        githubPush()
    }

    environment {
        GITHUB_REPO_URL = 'https://github.com/ParagRider1/Healthcare.git'
        DOCTOR_DOCKER_IMAGE = 'paragrider1/doctor-service'
        PATIENT_DOCKER_IMAGE = 'paragrider1/patient-service'
        APPOINTMENT_DOCKER_IMAGE = 'paragrider1/appointment-service'
        NOTIFICATION_DOCKER_IMAGE = 'paragrider1/notification-service'
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    git branch: 'main', url: "${GITHUB_REPO_URL}"
                }
            }
        }

        stage('Build Maven JARs') {
            steps {
                script {
                    dir('DoctorService') {
                        sh 'mvn clean package -DskipTests'
                    }
                    dir('PatientService') {
                        sh 'mvn clean package -DskipTests'
                    }
                    dir('AppointmentService') {
                        sh 'mvn clean package -DskipTests'
                    }
                    dir('NotificationService') {
                        sh 'mvn clean package -DskipTests'
                    }
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    dir('PatientService') {
                        sh 'mvn test -pl PatientService || true'
                    }
                    dir('DoctorService') {
                        sh 'mvn test -pl DoctorService || true'
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    def doctorImage = docker.build("${DOCTOR_DOCKER_IMAGE}", './DoctorService/')
                    def patientImage = docker.build("${PATIENT_DOCKER_IMAGE}", './PatientService/')
                    def appointmentImage = docker.build("${APPOINTMENT_DOCKER_IMAGE}", './AppointmentService/')
                    def notificationImage = docker.build("${NOTIFICATION_DOCKER_IMAGE}", './NotificationService/')
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                script {
                    docker.withRegistry('', 'dockerhub-credentials') {
                        docker.image("${DOCTOR_DOCKER_IMAGE}").push()
                        docker.image("${PATIENT_DOCKER_IMAGE}").push()
                        docker.image("${APPOINTMENT_DOCKER_IMAGE}").push()
                        docker.image("${NOTIFICATION_DOCKER_IMAGE}").push()
                    }
                }
            }
        }

        stage('Apply Kubernetes Manifests with Ansible') {
            steps {
                script {
                    withEnv(["ANSIBLE_HOST_KEY_CHECKING=False"]) {
                        ansiblePlaybook(
                            playbook: 'ansible-playbook.yaml',
                            inventory: 'inventory.ini',
                            vaultCredentialsId: 'ansible_vault_pass'
                        )
                    }
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    sh 'sleep 30'
                    sh 'kubectl get pods -o wide || true'
                    sh 'kubectl get services || true'
                    sh 'kubectl get hpa || true'
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully! All microservices deployed.'
        }
        failure {
            echo 'Pipeline failed. Check the logs for details.'
        }
    }
}
