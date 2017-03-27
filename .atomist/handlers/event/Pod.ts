import { HandleEvent, Message, Plan } from '@atomist/rug/operations/Handlers'
import { GraphNode, Match, PathExpression } from '@atomist/rug/tree/PathExpression'
import { EventHandler, Tags } from '@atomist/rug/operations/Decorators'

import { Pod } from "@atomist/rug/ext_model/Pod"

@EventHandler("pod-deployed", "Handle Kubernetes Pod deployment events", 
    new PathExpression<GraphNode, GraphNode>(
    `/Pod
        [/createdBy::Spec()/owns::Environment()]
        [/uses::Container()/isTagged::Tag()/isTagged::Commit()]`))
@Tags("kubernetes")
class Deployed implements HandleEvent<Pod, GraphNode> {
    handle(event: Match<Pod, GraphNode>): Plan {
        let pod: Pod = event.root()

        if ( pod.state() != 'running' ) {
            return
        }

        // it seems that the .createBy() cannot be called on Pod
        /*
        if ( pod.createdBy().owns().name() != 'prod.atomist.services.' ) {
            return
        }
        */

        let plan: Plan = new Plan()

        let message: Message = new Message("deployed")
        plan.add(message)

        return plan
    }
}
export const deployed = new Deployed()
