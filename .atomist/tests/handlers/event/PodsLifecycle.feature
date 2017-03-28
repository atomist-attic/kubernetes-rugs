Feature: Pods Lifecycle

Scenario: Deployment
 Given pod deployed handler registered
 When a deployment was successful
 Then the handler is called
 Then we should receive a message

Scenario: Crash Looping Pods
 Given pod crash looping handler registered
 When crash looping occurs
 Then the handler is called
 And the committer should receive a direct message
