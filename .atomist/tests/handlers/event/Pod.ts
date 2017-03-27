import { Given,When,Then, EventHandlerScenarioWorld } from "@atomist/rug/test/handler/Core"
import { Project } from "@atomist/rug/model/Project"
import { Build } from "@atomist/rug/ext_model_stub/Build"
import { Commit } from "@atomist/rug/ext_model_stub/Commit"
import { Tag } from "@atomist/rug/ext_model_stub/Tag"
import { Container } from "@atomist/rug/ext_model_stub/Container"
import { Pod } from "@atomist/rug/ext_model_stub/Pod"
import { Spec } from "@atomist/rug/ext_model_stub/Spec"
import { Environment } from "@atomist/rug/ext_model_stub/Environment"

When("a deployment was successful", (world: EventHandlerScenarioWorld) => {
   world.registerHandler("pod-deployed")

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
   pod.withState("running")
   pod.withUses(container)
   spec.withCreates(pod)

   world.sendEvent(pod);
})

Then("we should receive a message", (p: Project, world: EventHandlerScenarioWorld) => {
    return world.plan().messages.length == 1
})