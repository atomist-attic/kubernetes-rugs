import { HandleEvent, ChannelAddress, DirectedMessage, LifecycleMessage, MessageMimeTypes, ResponseMessage, Plan } from '@atomist/rug/operations/Handlers'
import { GraphNode, Match, PathExpression } from '@atomist/rug/tree/PathExpression'
import { EventHandler, Tags } from '@atomist/rug/operations/Decorators'
import * as query from '@atomist/rugs/util/tree/QueryByExample'
import { K8Pod } from "@atomist/cortex/stub/K8Pod"
import { DockerImage } from "@atomist/cortex/stub/DockerImage"
import { Tag } from "@atomist/cortex/Tag"
import { Commit } from "@atomist/cortex/Commit"
import { Repo } from "@atomist/cortex/Repo"
import { ChatChannel } from "@atomist/cortex/ChatChannel"

@EventHandler("pod-terminating", "Handle Kubernetes Pod terminating events", 
     `/K8Pod()
        [@state='Killing']
        [/images::DockerImage()
            [/tag::Tag()
                [/commit::Commit()
                    [/builds::Build()
                        [/push::Push()
                            [/commits::Commit()/author::GitHubId()
                                [/person::Person()/chatId::ChatId()]?]
                            [/repo::Repo()]]]]]]`
)
@Tags("kubernetes")
class Terminating implements HandleEvent<K8Pod, K8Pod> {
    handle(event: Match<K8Pod, K8Pod>): Plan {
        const pod: K8Pod = event.root() as K8Pod
        const image: DockerImage = pod.images[0]
        const commit: Commit = image.tag.commit
        const repo: Repo = commit.repo

        const lifecycleId: string = "commit_event/" + repo.owner + "/" + repo.name + "/" + commit.sha
        let message: LifecycleMessage = new LifecycleMessage(pod, lifecycleId)
       
        return Plan.ofMessage(message)
    }
}

export const terminating = new Terminating()
