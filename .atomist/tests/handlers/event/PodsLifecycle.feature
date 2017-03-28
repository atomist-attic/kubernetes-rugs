Feature: Kubernetes Pods Lifecycle
  In order for Atomist to be able to react to Kubernetes Pod conditions
  As an Atomist user
  I want to be notified when a pod has been deployed and when it has entered a crash loop

  Scenario: Deployment
    Given pod deployed handler registered
    When a deployment was successful
    Then the handler is called
      And we should receive a message

  Scenario: Crash Looping Pods
    Given pod crash looping handler registered
    When crash looping occurs
    Then the handler is called
      And the committer should receive a direct message
