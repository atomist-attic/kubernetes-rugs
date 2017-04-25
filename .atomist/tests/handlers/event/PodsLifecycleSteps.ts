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

import { EventHandlerScenarioWorld, Given, Then, When } from "@atomist/rug/test/handler/Core";

import { DirectedMessage, LifecycleMessage, PlanMessage } from "@atomist/rug/operations/Handlers";

import * as stub from "@atomist/cortex/stub/Types";

const owner = "atomist";
const repository = "myrugs";
const sha = "b20479edc0c2a202b18814cbd4e95463df04fb83";

function buildPodEvent(state: string, domain: string = "prod.atomist.services."): stub.K8Pod {
    const chatId = new stub.ChatId();
    chatId.withScreenName("me");

    const person = new stub.Person();
    person.withChatId(chatId);

    const gitHubId = new stub.GitHubId();
    gitHubId.withPerson(person);

    const commit = new stub.Commit();
    const tag = new stub.Tag();
    commit.withAuthor(gitHubId);
    tag.withCommit(commit);
    tag.withName("sometag");
    commit.addTags(tag);
    commit.withSha(sha);

    const build = new stub.Build();
    commit.addBuilds(build);
    build.withCommit(commit);

    const push = new stub.Push();
    push.addCommits(commit);
    push.addBuilds(build);
    build.withPush(push);
    commit.withPush(push);

    const repo = new stub.Repo();
    commit.withRepo(repo);
    push.withRepo(repo);
    repo.withOwner(owner);
    repo.withName(repository);

    const channel = new stub.ChatChannel();
    repo.addChannels(channel);

    const image = new stub.DockerImage();
    image.withTag(tag);

    const environment = new stub.Environment();
    environment.withName(domain);

    const spec = new stub.K8Spec();
    spec.withEnvironment(environment);
    image.withSpec(spec);
    spec.addImages(image);

    const pod = new stub.K8Pod();
    pod.withState(state);
    pod.withSpec(spec);
    pod.addImages(image);
    pod.withName("myservice");

    return pod;
}

Given("pod event handler registered", (world: EventHandlerScenarioWorld) => {
    world.registerHandler("K8PodEvent");
});

When("crash looping occurs", (world: EventHandlerScenarioWorld) => {
    const pod = buildPodEvent("BackOff");
    world.sendEvent(pod);
});

When("a deployment was successful", (world: EventHandlerScenarioWorld) => {
    const pod = buildPodEvent("Started");
    world.sendEvent(pod);
});

When("a container image is pulling", (world: EventHandlerScenarioWorld) => {
    const pod = buildPodEvent("Pulling");
    world.sendEvent(pod);
});

When("a pod is terminating", (world: EventHandlerScenarioWorld) => {
    const pod = buildPodEvent("Killing");
    world.sendEvent(pod);
});

When("a pod is unhealthy", (world: EventHandlerScenarioWorld) => {
    const pod = buildPodEvent("Unhealthy");
    world.sendEvent(pod);
});

Then("the handler is triggered", (world: EventHandlerScenarioWorld) => {
    return world.plan() != null;
});

Then("we should not receive anything", (world: EventHandlerScenarioWorld) => {
    return world.plan().messages.length === 0;
});

Then("the committer should receive a direct message", (world: EventHandlerScenarioWorld) => {
    const message = world.plan().messages[1] as DirectedMessage;
    return message.usernames[0] === "me";
});

Then("we should receive a message", (world: EventHandlerScenarioWorld) => {
    const lifecycleId = `commit_event/${owner}/${repository}/${sha}`;
    const message = world.plan().messages[0] as LifecycleMessage;
    return message.lifecycleId === lifecycleId;
});
