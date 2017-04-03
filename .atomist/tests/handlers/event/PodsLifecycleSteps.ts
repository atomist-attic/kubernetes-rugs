import { Given, When, Then, EventHandlerScenarioWorld } from "@atomist/rug/test/handler/Core"
import { Message } from "@atomist/rug/operations/Handlers"
import { Build } from "@atomist/cortex/stub/Build"
import { Commit } from "@atomist/cortex/stub/Commit"
import { Tag } from "@atomist/cortex/stub/Tag"
import { Container } from "@atomist/cortex/stub/Container"
import { Pod } from "@atomist/cortex/stub/Pod"
import { Spec } from "@atomist/cortex/stub/Spec"
import { Environment } from "@atomist/cortex/stub/Environment"
import { Person } from "@atomist/cortex/stub/Person"
import { ChatId } from "@atomist/cortex/stub/ChatId"
import { GitHubId } from "@atomist/cortex/stub/GitHubId"
import { Repo } from "@atomist/cortex/stub/Repo"
import { ChatChannel } from "@atomist/cortex/stub/ChatChannel"


function buildPodEvent(state: string, domain: string = "prod.atomist.services."): Pod {
    const chatId: ChatId = new ChatId
    chatId.withId("me")
   
    const person: Person = new Person
    person.withHasChatIdentity(chatId)

    const gitHubId: GitHubId = new GitHubId
    gitHubId.withOf(person)

    const commit: Commit = new Commit
    const tag: Tag = new Tag
    commit.withIsTagged([tag])
    commit.withAuthor(gitHubId)
    tag.withOnCommit(commit)

    const container: Container = new Container
    container.withIsTagged(tag)

    const environment: Environment = new Environment
    environment.withDomainName(domain)

    const spec: Spec = new Spec
    environment.withOwns(spec)

    const pod: Pod = new Pod
    pod.withState(state).withUses(container)
    spec.withCreates([pod])

    return pod
}

Given("pod deployed handler registered", (world: EventHandlerScenarioWorld) => {
    world.registerHandler("pod-deployed")  
})

Given("pod crash looping handler registered", (world: EventHandlerScenarioWorld) => {
    world.registerHandler("pod-crash-looping") 
})

Given("pod container image pulled handler registered", (world: EventHandlerScenarioWorld) => {
    world.registerHandler("pod-container-image-pulled")  
})

Given("pod terminating handler registered", (world: EventHandlerScenarioWorld) => {
    world.registerHandler("pod-terminating")  
})

Given("pod unhealthy handler registered", (world: EventHandlerScenarioWorld) => {
    world.registerHandler("pod-unhealthy")  
})

When("crash looping occurs", (world: EventHandlerScenarioWorld) => {
    const pod: Pod = buildPodEvent("BackOff")
    world.sendEvent(pod)
})

When("a deployment was successful", (world: EventHandlerScenarioWorld) => {
    const pod: Pod = buildPodEvent("Started")
    world.sendEvent(pod)
})

When("a container image was pulled", (world: EventHandlerScenarioWorld) => {
    const pod: Pod = buildPodEvent("Pulled")
    world.sendEvent(pod)
})

When("a pod is terminating", (world: EventHandlerScenarioWorld) => {
    const pod: Pod = buildPodEvent("Killing")

    world.sendEvent(pod)
})

Then("the handler is triggered", (world: EventHandlerScenarioWorld) => {
    return world.plan() != null
})

Then("the committer should receive a direct message", (world: EventHandlerScenarioWorld) => {
    const message: Message = world.plan().messages[0]
    return message.channelId == "me"
})

Then("we should receive a message", (world: EventHandlerScenarioWorld) => {
    return world.plan().messages.length == 1
})
