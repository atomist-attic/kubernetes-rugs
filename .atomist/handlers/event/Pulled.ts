import { HandleEvent, Message, Plan } from '@atomist/rug/operations/Handlers'
import { GraphNode, Match, PathExpression } from '@atomist/rug/tree/PathExpression'
import { EventHandler, Tags } from '@atomist/rug/operations/Decorators'
import * as query from '@atomist/rugs/util/tree/QueryByExample'
import { Pod } from "@atomist/cortex/stub/Pod"
import { Container } from "@atomist/cortex/stub/Container"
import { Tag } from "@atomist/cortex/stub/Tag"
import { Commit } from "@atomist/cortex/stub/Commit"
import { Repo } from "@atomist/cortex/stub/Repo"
import { ChatChannel } from "@atomist/cortex/stub/ChatChannel"

@EventHandler("pod-container-image-pulled", "Handle Kubernetes Pod contaoiner image pulled", 
     query.forRoot(
         new Pod().withState("Pulled")
            .withUses(new Container()
                .withIsTagged(new Tag()
                    .withOnCommit(new Commit()
                        .withOn(new Repo()
                            .withChannel([new ChatChannel()]
)))))))
@Tags("kubernetes")
class Pulled implements HandleEvent<Pod, GraphNode> {
    handle(event: Match<Pod, GraphNode>): Message {
        const pod: Pod = event.root()
        const container: Container = pod.uses()

        let message: Message = new Message(`${pod.name()} pulled ${container.image()}`)

        return message
    }
}

export const pulled = new Pulled()
