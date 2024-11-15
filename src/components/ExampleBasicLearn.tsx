import React, { useState } from "react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

type Post = {
  id: number;
  title: string;
  body: string;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 jam
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: async (): Promise<Array<Post>> => {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts"
      );
      return await response.json();
    },
  });
}

function Posts({
  setPostId,
}: {
  setPostId: React.Dispatch<React.SetStateAction<number>>;
}) {
  const queryClient = useQueryClient();
  const { status, error, data, isFetching } = usePosts();

  return (
    <div>
      <h1 className="text-3xl font-bold mt-4">Posts</h1>
      {status === "pending" ? (
        <h1>Loading...</h1>
      ) : status === "error" ? (
        <p>Error : {error.message}</p>
      ) : (
        <>
          <div className="mt-1">
            {data.map((post) => (
              <p key={post.id}>
                <a
                  onClick={() => setPostId(post.id)}
                  href="#"
                  style={
                    queryClient.getQueryData(["post", post.id])
                      ? { color: "green" }
                      : {}
                  }
                  className="underline underline-offset-2 hover:text-sky-500"
                >
                  {post.title}
                </a>
              </p>
            ))}
          </div>
          <div>{isFetching ? "Background Updating" : " "}</div>
        </>
      )}
    </div>
  );
}

const getPostById = async (id: number): Promise<Post> => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${id}`
  );
  return await response.json();
};

function usePost(postId: number) {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });
}

function Post({
  postId,
  setPostId,
}: {
  postId: number;
  setPostId: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { status, error, data, isFetching } = usePost(postId);

  return (
    <div className="mt-4">
      <div>
        <a
          onClick={() => setPostId(-1)}
          href="#"
          className="text-xl font-bold text-red-400 hover:text-red-500"
        >
          Back to Posts
        </a>
      </div>
      {!postId || status === "pending" ? (
        <p>Loading...</p>
      ) : status === "error" ? (
        <p>Error : {error.message}</p>
      ) : (
        <>
          <h1 className="underline">Title</h1>
          <h1>{data.title}</h1>
          <div className="mt-2">
            <p className="underline">Body</p>
            <p>{data.body}</p>
          </div>
          <div>{isFetching ? "Background Updating..." : " "}</div>
        </>
      )}
    </div>
  );
}

const ExampleBasicLearn = () => {
  const [postId, setPostId] = useState(-1);
  console.log(postId);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <h1 className="text-3xl font-bold mb-2">React Query</h1>
      <p>
        As you visit the posts below, you will notice them in a loading state
        the first time you load them. However, after you return to this list and
        click on any posts you have already visited again, you will see them
        load instantly and background refresh right before your eyes!{" "}
        <strong>
          (You may need to throttle your network speed to simulate longer
          loading sequences)
        </strong>
      </p>
      {postId > -1 ? (
        <Post postId={postId} setPostId={setPostId} />
      ) : (
        <Posts setPostId={setPostId} />
      )}
    </PersistQueryClientProvider>
  );
};

export default ExampleBasicLearn;
