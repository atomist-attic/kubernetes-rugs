import { HandleEvent, DirectedMessage, ChannelAddress, MessageMimeTypes, Plan } from '@atomist/rug/operations/Handlers'
import { GraphNode, Match, PathExpression } from '@atomist/rug/tree/PathExpression'
import { EventHandler, Tags } from '@atomist/rug/operations/Decorators'
import * as query from '@atomist/rugs/util/tree/QueryByExample'
import { K8Pod } from "@atomist/cortex/K8Pod"
import { DockerImage } from "@atomist/cortex/DockerImage"
import { Tag } from "@atomist/cortex/Tag"
import { Commit } from "@atomist/cortex/Commit"
import { GitHubId } from "@atomist/cortex/GitHubId"
import { Person } from "@atomist/cortex/Person"
import { ChatId } from "@atomist/cortex/ChatId"
import { Repo } from "@atomist/cortex/Repo"

@EventHandler("pod-crash-looping", "Handle Kubernetes Pod Crash Looping events", 
     `/K8Pod()
        [@state='BackOff']
        [/images::DockerImage()
          [/tag::Tag()
            [/commit::Commit()
              [/builds::Build()
                  [/push::Push()
                      [/commits::Commit()/author::GitHubId()
                          [/person::Person()/chatId::ChatId()]?]
                      [/repo::Repo()]]]
              [/author::GitHubId()
                [/person::Person()
                  [/chatId::ChatId()]]]]]]`
)
@Tags("kubernetes")
class CrashLooping implements HandleEvent<K8Pod, K8Pod> {
    handle(event: Match<K8Pod, K8Pod>): Plan {
        const pod: K8Pod = event.root() as K8Pod
        const tag = pod.images[0].tag
        const commit: Commit = tag.commit
        const repo: Repo = commit.repo
        const author = commit.author
        const person = author.person
        const chatIdentity = person.chatId
        const chatName = chatIdentity.screenName

        const addr: ChannelAddress = new ChannelAddress(chatName)
        const message = new DirectedMessage(`Pod '${pod.name}' is crash looping`, 
          addr, MessageMimeTypes.PLAIN_TEXT)

        return Plan.ofMessage(message)
    }
}

export const failedDeploy = new CrashLooping