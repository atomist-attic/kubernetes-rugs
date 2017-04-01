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

@EventHandler("pod-scheduled", "Handle Kubernetes Pod scheduled events", 
     `/Pod()
        [@state='Scheduled']
        [/uses::Container()
            [/isTagged::Tag()
                [/isTagged::Commit()
                    [/on::Repo()/channel::ChatChannel()]]]]`
)
@Tags("kubernetes")
class Scheduled implements HandleEvent<Pod, GraphNode> {
    handle(event: Match<Pod, GraphNode>): Plan {
            try {
        const pod: Pod = event.root()
        const container: Container = pod.uses()
        const commit: Commit = container.isTagged().onCommit()
        const repo: Repo = commit.on()

        const cid = "commit_event/" + repo.owner() + "/" + repo + "/" + commit.sha()

        let message: Message = new Message(`${pod.name()} has been scheduled`)
        message.withCorrelationId(cid)
        message.withNode(pod)

        return Plan.ofMessage(message)
    }
            catch (e) {
                console.log((<Error>e).message)
            }

        return Plan.ofMessage(new Message("boom"))
    }
}

export const scheduled = new Scheduled()
