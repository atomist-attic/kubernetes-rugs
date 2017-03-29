import { HandleEvent, Message, Plan } from '@atomist/rug/operations/Handlers'
import { GraphNode, Match, PathExpression } from '@atomist/rug/tree/PathExpression'
import { EventHandler, Tags } from '@atomist/rug/operations/Decorators'
import * as query from '@atomist/rugs/util/tree/QueryByExample'
import { Pod } from "@atomist/cortex/stub/Pod"
import { Container } from "@atomist/cortex/stub/Container"
import { Tag } from "@atomist/cortex/stub/Tag"

/*
new PathExpression<GraphNode, GraphNode>(
    `/Pod()[@state="Started"]
        [/uses::Container()/isTagged::Tag()]`)
        */

@EventHandler("pod-deployed", "Handle Kubernetes Pod deployment events", 
     query.forRoot(
         new Pod().withState("Started")
            .withUses(new Container()
                .withIsTagged(new Tag())
)))
@Tags("kubernetes")
class Deployed implements HandleEvent<Pod, GraphNode> {
    handle(event: Match<Pod, GraphNode>): Message {
        const pod: Pod = event.root()

        let message: Message = new Message("deployed")

        return message
    }
}

export const deployed = new Deployed()
