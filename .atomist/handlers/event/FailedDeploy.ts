import { HandleEvent, Message, Plan } from '@atomist/rug/operations/Handlers'
import { GraphNode, Match, PathExpression } from '@atomist/rug/tree/PathExpression'
import { EventHandler, Tags } from '@atomist/rug/operations/Decorators'
import * as query from '@atomist/rugs/util/tree/QueryByExample'
import { Pod } from "@atomist/cortex/stub/Pod"
import { Container } from "@atomist/cortex/stub/Container"
import { Tag } from "@atomist/cortex/stub/Tag"

@EventHandler("pod-failed-to-deploy", "Handle Kubernetes Pod failed deployment events", 
     query.forRoot(
         new Pod().withState("Failed")
            .withUses(new Container()
                .withIsTagged(new Tag())
)))
@Tags("kubernetes")
class FailedDeploy implements HandleEvent<Pod, GraphNode> {
    handle(event: Match<Pod, GraphNode>): Plan {
        let pod: Pod = event.root()

        let tag: Tag = pod.uses().isTagged();

        let plan: Plan = new Plan()

        let message: Message = new Message("Failed to Deploy Pod")
        message.withNode(tag)

        plan.add(message)

        return plan
    }
}

export const failedDeploy = new FailedDeploy()