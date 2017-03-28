import { Given,When,Then, EventHandlerScenarioWorld } from "@atomist/rug/test/handler/Core"
import { Project } from "@atomist/rug/model/Project"
import { Build } from "@atomist/cortex/stub/Build"
import { Commit } from "@atomist/cortex/stub/Commit"
import { Tag } from "@atomist/cortex/stub/Tag"
import { Container } from "@atomist/cortex/stub/Container"
import { Pod } from "@atomist/cortex/stub/Pod"
import { Spec } from "@atomist/cortex/stub/Spec"
import { Environment } from "@atomist/cortex/stub/Environment"

When("a deployment was unsuccessful", (world: EventHandlerScenarioWorld) => {
   world.registerHandler("pod-failed-to-deploy")

   let commit: Commit = new Commit
   let tag: Tag = new Tag
   commit.withIsTagged([tag])

   let container: Container = new Container
   container.withIsTagged(tag)

   let environment: Environment = new Environment
   environment.withDomainName("prod.atomist.services.")

   let spec: Spec = new Spec
   environment.withOwns(spec)

   let pod: Pod = new Pod
   pod.withState("Failed").withUses(container)
   spec.withCreates(pod)

   world.sendEvent(pod)
})

Then("we should receive a direct message", (p: Project, world: EventHandlerScenarioWorld) => {
    return world.plan().messages.length == 1
})