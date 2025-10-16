import { model, Schema } from "mongoose";

const StorySchema = new Schema({
  title: {
    type: String,
    required: true,
    unique:true
  },
  content: {
    type: String,
    required: true
  },
  media: {
    type: Array
  }
}) 

const Story = model('Story', StorySchema)
export default Story
/* model Story {
  id         Int       @id @default(autoincrement())
  title      String
  content    String?
  media      String?
  timestamp  DateTime  @default(now())
  Admin      Admin[]
}
  */