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
     `/Pod()
        [@state='Pulled']
        [/uses::Container()
            [/isTagged::Tag()
                [/isTagged::Commit()
                    [/on::Repo()/channel::ChatChannel()]]]]`
)
@Tags("kubernetes")
class Pulled implements HandleEvent<Pod, Pod> {
    handle(event: Match<Pod, Pod>): Plan {
        const pod: Pod = event.root() as Pod
        const container: Container = pod.uses()
        const commit: Commit = container.isTagged().onCommit()
        const repo: Repo = commit.on()

        const cid: string = "commit_event/" + repo.owner() + "/" + repo.name() + "/" + commit.sha()

        let message: Message = new Message(`Pod '${pod.name()}' pulled container image '${container.image()}'`)

        //message.withCorrelationId(cid)
        message.withNode(pod)

        return Plan.ofMessage(message)
    }
}

export const pulled = new Pulled()
