import { Given,When,Then, EventHandlerScenarioWorld } from "@atomist/rug/test/handler/Core"
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

Given("pod deployed handler registered", (world: EventHandlerScenarioWorld) => {
    world.registerHandler("pod-deployed")  
})

Given("pod crash looping handler registered", (world: EventHandlerScenarioWorld) => {
    world.registerHandler("pod-crash-looping") 
})

When("crash looping occurs", (world: EventHandlerScenarioWorld) => {
   
   let chatId: ChatId = new ChatId
   chatId.withId("me")
   
   let person: Person = new Person
   person.withHasChatIdentity(chatId)

   let gitHubId: GitHubId = new GitHubId
   gitHubId.withOf(person)

   let commit: Commit = new Commit
   let tag: Tag = new Tag
   commit.withIsTagged([tag])
   commit.withAuthor(gitHubId)
   tag.withOnCommit(commit)

   let container: Container = new Container
   container.withIsTagged(tag)

   let environment: Environment = new Environment
   environment.withDomainName("prod.atomist.services.")

   let spec: Spec = new Spec
   environment.withOwns(spec)

   let pod: Pod = new Pod
   pod.withState("BackOff").withUses(container)
   spec.withCreates([pod])

   world.sendEvent(pod)
})

When("a deployment was successful", (world: EventHandlerScenarioWorld) => {

   let commit: Commit = new Commit
   let tag: Tag = new Tag
   commit.withIsTagged([tag])

   let container: Container = new Container
   container.withIsTagged(tag)

   let environment: Environment = new Environment
   environment.withDomainName("prod.atomist.services.")

   let spec: Spec = new Spec
   environment.withOwns(spec)

   let pod: Pod = new Pod;
   pod.withState("Started").withUses(container)
   spec.withCreates([pod])

   world.sendEvent(pod)
})

Then("the handler is called", (p: Project, world: EventHandlerScenarioWorld) => {
  return world.plan() != null
})

Then("the committer should receive a direct message", (p: Project, world: EventHandlerScenarioWorld) => {
    let message: Message = world.plan().messages[0]
    return message.channelId == "me"
})

Then("we should receive a message", (p: Project, world: EventHandlerScenarioWorld) => {
    return world.plan().messages.length == 1
})
