/*
 * Copyright © 2017 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { EventHandler, Tags } from "@atomist/rug/operations/Decorators";
import {
    DirectedMessage,
    EventPlan,
    HandleEvent,
    LifecycleMessage,
    MessageMimeTypes,
    UserAddress,
} from "@atomist/rug/operations/Handlers";
import { GraphNode, Match, PathExpression } from "@atomist/rug/tree/PathExpression";

import { Commit } from "@atomist/cortex/Commit";
import { DockerImage } from "@atomist/cortex/DockerImage";
import { K8Pod } from "@atomist/cortex/K8Pod";
import { Repo } from "@atomist/cortex/Repo";
import { Tag } from "@atomist/cortex/Tag";

import * as query from "@atomist/rugs/util/tree/QueryByExample";

@EventHandler("K8PodEvent", "Handle Kubernetes Pod events",
    `/K8Pod()
        [/images::DockerImage()
            [/tag::Tag()
                [/commit::Commit()
                    [/builds::Build()
                        [/push::Push()
                            [/commits::Commit()/author::GitHubId()
                                [/person::Person()/chatId::ChatId()]?]
                            [/repo::Repo()/channels::ChatChannel()]]]]]]`,
)
@Tags("kubernetes")
class K8PodEvent implements HandleEvent<K8Pod, K8Pod> {
    public handle(event: Match<K8Pod, K8Pod>): EventPlan {
        return new EventPlan();
    }
}

export const k8PodEvent = new K8PodEvent();
