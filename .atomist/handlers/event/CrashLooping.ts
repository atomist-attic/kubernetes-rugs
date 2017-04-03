import { HandleEvent, Message, Plan } from '@atomist/rug/operations/Handlers'
import { GraphNode, Match, PathExpression } from '@atomist/rug/tree/PathExpression'
import { EventHandler, Tags } from '@atomist/rug/operations/Decorators'
import * as query from '@atomist/rugs/util/tree/QueryByExample'
import { Pod } from "@atomist/cortex/stub/Pod"
import { Container } from "@atomist/cortex/stub/Container"
import { Tag } from "@atomist/cortex/stub/Tag"
import { Commit } from "@atomist/cortex/stub/Commit"
import { GitHubId } from "@atomist/cortex/stub/GitHubId"
import { Person } from "@atomist/cortex/stub/Person"
import { ChatId } from "@atomist/cortex/stub/ChatId"

@EventHandler("pod-crash-looping", "Handle Kubernetes Pod Crash Looping events", 
     `/Pod()
        [@state='BackOff']
        [/uses::Container()
          [/isTagged::Tag()
            [/isTagged::Commit()
              [/author::GitHubId()
                [/hasGithubIdentity::Person()
                  [/hasChatIdentity::ChatId()]]]]]]`
)
@Tags("kubernetes")
class CrashLooping implements HandleEvent<Pod, Pod> {
    handle(event: Match<Pod, Pod>): Plan {
        const pod: Pod = event.root() as Pod
        const container = pod.uses()
        const tag = container.isTagged()
        const commit = tag.onCommit()
        const author = commit.author()
        const person = author.of()
        const chatIdentity = person.hasChatIdentity()
        const chatId = chatIdentity.id()

        const message = new Message(`Pod '${pod.name()}' is crash looping`)

        message.channelId = chatId

        return Plan.ofMessage(message)
    }
}

export const failedDeploy = new CrashLooping