import { Given, When, Then, EventHandlerScenarioWorld } from "@atomist/rug/test/handler/Core"
import { Project } from "@atomist/rug/model/Project"
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

const slackChannelAndId = "me"
const targetEnvironmentDomain = "prod.atomist.services."
const kubernetesCrashLoopingState = "BackOff"
const kubernetesDeployedState = "Started"

Given("pod deployed handler registered", (world: EventHandlerScenarioWorld) => {
    world.registerHandler("pod-deployed")  
})

Given("pod crash looping handler registered", (world: EventHandlerScenarioWorld) => {
    world.registerHandler("pod-crash-looping") 
})

When("crash looping occurs", (world: EventHandlerScenarioWorld) => {
   
    const chatId: ChatId = new ChatId
    chatId.withId(slackChannelAndId)
   
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
    environment.withDomainName(targetEnvironmentDomain)

    const spec: Spec = new Spec
    environment.withOwns(spec)

    const pod: Pod = new Pod
    pod.withState(kubernetesCrashLoopingState).withUses(container)
    spec.withCreates([pod])

    world.sendEvent(pod)
})

When("a deployment was successful", (world: EventHandlerScenarioWorld) => {

    const commit: Commit = new Commit
    const tag: Tag = new Tag
    commit.withIsTagged([tag])

    const container: Container = new Container
    container.withIsTagged(tag)

    const environment: Environment = new Environment
    environment.withDomainName(targetEnvironmentDomain)

    const spec: Spec = new Spec
    environment.withOwns(spec)

    const pod: Pod = new Pod;
    pod.withState(kubernetesDeployedState).withUses(container)
    spec.withCreates([pod])

    world.sendEvent(pod)
})

Then("the handler is triggered", (p: Project, world: EventHandlerScenarioWorld) => {
    return world.plan() != null
})

Then("the committer should receive a direct message", (p: Project, world: EventHandlerScenarioWorld) => {
    const message: Message = world.plan().messages[0]
    return message.channelId == slackChannelAndId
})

Then("we should receive a message", (p: Project, world: EventHandlerScenarioWorld) => {
    return world.plan().messages.length == 1
})
