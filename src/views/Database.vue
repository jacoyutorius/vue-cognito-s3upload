<template>
  <b-container fluid>
    <b-row class="text-center">
      <b-col md="6" class="py-3">
        <div class="text-center my-3">
          <b-form @submit="createPost" @reset="onReset">
            <b-form-input id="input-none" :state="null" type="text" placeholder="No validation"></b-form-input>
            <b-button variant="primary" :size="sm">Add Comment</b-button>

            <!-- <b-form-group label="Name:">
              <b-form-input type="text" v-model="postData.name" required placeholder="Name"></b-form-input>
            </b-form-group>-->
            <b-form-textarea
              v-model="postData.description"
              placeholder="Enter something"
              :rows="3"
              :max-rows="6"
            ></b-form-textarea>

            <!-- <amplify-photo-picker v-bind:photoPickerConfig="photoPickerConfig"></amplify-photo-picker> -->
            <div class="form-group">
              <label for="imageFile">Image</label>
              <input type="file" class="form-control-file" id="imageFile">
            </div>

            <b-button type="submit" variant="primary">Submit</b-button>
            <b-button type="reset" variant="danger">Reset</b-button>
          </b-form>
        </div>
      </b-col>
      <b-col md="6" class="py-3">
        <table class="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="todo in todos" v-bind:key="todo.id">
              <td>
                <amplify-s3-image :imagePath="todo.name"></amplify-s3-image>
                {{ todo.name }}
              </td>
              <td>{{ todo.description }}</td>
            </tr>
          </tbody>
        </table>
      </b-col>
    </b-row>

    <b-row class="text-center">
      <amplify-s3-album path="public"></amplify-s3-album>
    </b-row>
  </b-container>
</template>

<script>
import { API, graphqlOperation, Storage } from "aws-amplify";
import * as subscriptions from "../graphql/subscriptions.js";
import * as mutations from "../graphql/mutations.js";
import * as queries from "../graphql/queries.js";

export default {
  name: "Database",
  data: () => {
    return {
      postData: {
        name: "",
        description: "",
        done: false
      },
      comments: [],
      myPost: "",
      errors: [],
      todos: [],
      photoPickerConfig: {
        path: "upload"
      }
    };
  },
  mounted: function() {
    API.graphql(graphqlOperation(queries.listTodos))
      .then(result => {
        if (
          result &&
          result.data &&
          result.data.listTodos &&
          result.data.listTodos.items
        ) {
          this.todos = result.data.listTodos.items;
        }
      })
      .catch(error => {
        console.error(error);
      });

    API.graphql(graphqlOperation(subscriptions.onCreateTodo)).subscribe({
      next: data => {
        const result = data.value.data.onCreateTodo;
        console.info(result);

        this.todos.push({
          id: result.id,
          name: result.name,
          description: result.description,
          done: result.done
        });
      },
      error: error => {
        console.error(error);
      }
    });
  },
  methods: {
    createPost: async function(event) {
      event.preventDefault();

      console.log("event", event);

      // Storage.put(event.target[3].files[0], event.target[3].files[0].name)
      //   .then(result => console.log(result))
      //   .catch(err => console.log(err));

      const result = await Storage.put(
        event.target[1].files[0].name,
        event.target[1].files[0]
      );
      console.log(result);

      this.$data.postData.name = result.key;

      const comment = await API.graphql(
        graphqlOperation(mutations.createComment, {
          input: { text: "this is comment" }
        })
      );
      console.log("comment", comment);

      const input = this.$data.postData;
      input["list"] = [comment.data.createComment.id];

      API.graphql(graphqlOperation(mutations.createTodo, { input: input }))
        .then(response => {
          console.log(response);
          this.myPost = response;
        })
        .catch(error => {
          console.error(error);
          this.errors = error.errors;
        });
    },
    onReset: () => {}
  }
};
</script>