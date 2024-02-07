import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
    @Prop({
        type: String,
        default: function genUUID() {
            return uuidv4();
        },
    })
    id: string;

    @Prop({ unique: true })
    username!: string;

    @Prop()
    password!: string;

    @Prop()
    firstName!: string;

    @Prop()
    lastName!: string;

    @Prop()
    lastSignIn?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
