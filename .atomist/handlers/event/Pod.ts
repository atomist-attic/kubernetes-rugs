import { HandleEvent, Message, Plan } from '@atomist/rug/operations/Handlers'
import { GraphNode, Match, PathExpression } from '@atomist/rug/tree/PathExpression'
import { EventHandler, Tags } from '@atomist/rug/operations/Decorators'
//import { Pod } from '@atomist/cortex/Pod'
import * as query from '@atomist/rugs/util/tree/QueryByExample'
import { Pod } from "@atomist/cortex/stub/Pod"
import { Container } from "@atomist/cortex/stub/Container"

/*
new PathExpression<GraphNode, GraphNode>(
    `/Pod()[@state="Started"]
        [/uses::Container()/isTagged::Tag()]`)
        */

@EventHandler("pod-deployed", "Handle Kubernetes Pod deployment events", 
     query.forRoot(new Pod().withState("Started")
 .withUses(new Container() )))
@Tags("kubernetes")
class Deployed implements HandleEvent<Pod, GraphNode> {
    handle(event: Match<Pod, GraphNode>): Plan {
        let pod: Pod = event.root()

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
