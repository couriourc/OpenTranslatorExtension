import {z} from "zod";

export const Z_SystemCommand = z.enum(["open-option", 'abort', "openai"] as const);
export type Z_SystemCommand = z.infer<typeof Z_SystemCommand>



/*在 background 中能执行的命令*/
export const TBackgroundCommands = z.enum(["open-option", 'abort', "openai"] as const);
export type TBackgroundCommands = z.infer<typeof TBackgroundCommands>;
/*在 content scripts 中能执行的命令*/
export type TContentScriptCommand = z.infer<typeof TContentScriptCommand>;
export const TContentScriptCommand = z.enum(["open-sidebar", "open-popup"] as const);
/*整个系统通用的指令*/
export type TSysCommand = 'abort';
export type TAllCommandType = "open-option"
    | "open-setting"
    | "open-translator"
    | TBackgroundCommands
    | TContentScriptCommand
    | TSysCommand;
