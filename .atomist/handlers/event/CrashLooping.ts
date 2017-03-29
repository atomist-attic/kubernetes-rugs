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
     query.forRoot(
         new Pod().withState("BackOff")
           .withUses(new Container()
             .withIsTagged(new Tag()
               .withOnCommit(new Commit()
                 .withAuthor(new GitHubId()
                   .withOf(new Person()
                     .withHasChatIdentity(new ChatId())
                   ))))))
)
@Tags("kubernetes")
class CrashLooping implements HandleEvent<Pod, GraphNode> {
    handle(event: Match<Pod, GraphNode>): Message {
        
        const pod: Pod = event.root()
        const container = pod.uses()
        const tag = container.isTagged()
        const commit = tag.onCommit()
        const author = commit.author()
        const person = author.of()
        const chatIdentity = person.hasChatIdentity()
        const chatId = chatIdentity.id()

        const message = new Message(`${pod.name()} is crash looping`)

        message.channelId = chatId

        return message
    }
}

export const failedDeploy = new CrashLooping