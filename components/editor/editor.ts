import {NgModule,Component,ElementRef,AfterViewInit,Input,Output,EventEmitter,ContentChild,OnChanges,forwardRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Header} from '../common/shared'
import {DomHandler} from '../dom/domhandler';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';

declare var Quill: any;

export const EDITOR_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => Editor),
  multi: true
};

@Component({
    selector: 'p-editor',
    template: `
        <div [ngClass]="'ui-widget ui-editor-container ui-corner-all'" [class]="styleClass">
            <div class="ui-editor-toolbar ui-widget-header ui-corner-top" *ngIf="toolbar">
                <ng-content select="header"></ng-content>
            </div>
            <div class="ui-editor-toolbar ui-widget-header ui-corner-top" *ngIf="!toolbar">
                <span class="ql-formats">
                    <select class="ql-header">
                      <option value="1">Heading</option>
                      <option value="2">Subheading</option>
                      <option selected>Normal</option>
                    </select>
                    <select class="ql-font">
                      <option selected>Sans Serif</option>
                      <option value="serif">Serif</option>
                      <option value="monospace">Monospace</option>
                    </select>
                </span>
                <span class="ql-formats">
                    <button class="ql-bold"></button>
                    <button class="ql-italic"></button>
                    <button class="ql-underline"></button>
                </span>
                <span class="ql-formats">
                    <select class="ql-color"></select>
                    <select class="ql-background"></select>
                </span>
                <span class="ql-formats">
                    <button class="ql-list" value="ordered"></button>
                    <button class="ql-list" value="bullet"></button>
                    <select class="ql-align">
                        <option selected></option>
                        <option value="center"></option>
                        <option value="right"></option>
                        <option value="justify"></option>
                    </select>
                </span>
                <span class="ql-formats">
                    <button class="ql-link"></button>
                    <button class="ql-image"></button>
                    <button class="ql-code-block"></button>
                </span>
                <span class="ql-formats">
                    <button class="ql-clean"></button>
                </span>
            </div>
            <div class="ui-editor-content" [ngStyle]="style"></div>
        </div>
    `,
    providers: [DomHandler,EDITOR_VALUE_ACCESSOR]
})
export class Editor implements AfterViewInit,ControlValueAccessor {
        
    @Output() onTextChange: EventEmitter<any> = new EventEmitter();
    
    @Output() onSelectionChange: EventEmitter<any> = new EventEmitter();
    
    @ContentChild(Header) toolbar;
    
    @Input() style: any;
        
    @Input() styleClass: string;
    
    @Input() placeholder: string;
    
    @Input() readOnly: boolean;
    
    @Input() formats: string[];
    
    value: string;
    
    onModelChange: Function = () => {};
    
    onModelTouched: Function = () => {};
    
    quill: any;
    
    constructor(protected el: ElementRef, protected domHandler: DomHandler) {}

    ngAfterViewInit() {
        let editorElement = this.domHandler.findSingle(this.el.nativeElement ,'div.ui-editor-content'); 
        let toolbarElement = this.domHandler.findSingle(this.el.nativeElement ,'div.ui-editor-toolbar'); 
        
        this.quill = new Quill(editorElement, {
          modules: {
              toolbar: toolbarElement
          },
          placeholder: this.placeholder,
          readOnly: this.readOnly,
          theme: 'snow',
          formats: this.formats
        });
                
        if(this.value) {
            this.quill.pasteHTML(this.value);
        }
        
        this.quill.on('text-change', (delta, source) => {
            let html = editorElement.children[0].innerHTML;
            let text = this.quill.getText();
            if(html == '<p><br></p>') {
                html = null;
            }

            this.onTextChange.emit({
                htmlValue: html,
                textValue: text,
                delta: delta,
                source: source
            });
            
            this.onModelChange(html);
        });
        
        this.quill.on('selection-change', (range, oldRange, source) => {
            this.onSelectionChange.emit({
                range: range,
                oldRange: oldRange,
                source: source
            });
        });
    }
        
    writeValue(value: any) : void {
        this.value = value;
                
        if(this.quill) {
            if(value)
                this.quill.pasteHTML(value);
            else
                this.quill.setText('');
        }
    }
    
    registerOnChange(fn: Function): void {
        this.onModelChange = fn;
    }

    registerOnTouched(fn: Function): void {
        this.onModelTouched = fn;
    }
}

@NgModule({
    imports: [CommonModule],
    exports: [Editor],
    declarations: [Editor]
})
export class EditorModule { }